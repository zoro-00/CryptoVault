// News service - Fetch LIVE crypto news from RSS feeds via rss2json API
import type { ApiResponse, PaginatedResponse } from "@/lib/types";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  source: string;
  url: string;
  imageUrl?: string;
  category: "market" | "technology" | "regulation" | "adoption" | "general";
  tags: string[];
  publishedAt: Date;
  sentiment?: "positive" | "neutral" | "negative";
}

// ── RSS feed sources ────────────────────────────────────────────────
const RSS_FEEDS = [
  {
    url: "https://cointelegraph.com/rss",
    source: "CoinTelegraph",
    defaultCategory: "general" as const,
  },
  {
    url: "https://coindesk.com/arc/outboundfeeds/rss/",
    source: "CoinDesk",
    defaultCategory: "market" as const,
  },
  {
    url: "https://decrypt.co/feed",
    source: "Decrypt",
    defaultCategory: "technology" as const,
  },
];

const RSS2JSON_URL = "https://api.rss2json.com/v1/api.json";

// ── Helpers ─────────────────────────────────────────────────────────

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Extract the first image URL from HTML content */
function extractImageUrl(html: string): string | undefined {
  const match = html.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif)[^"]*)"/i);
  return match?.[1];
}

/** Try to determine a category from the article's content/categories */
function guessCategory(
  categories: string[],
  title: string,
  defaultCat: NewsArticle["category"]
): NewsArticle["category"] {
  const text = [...categories, title].join(" ").toLowerCase();

  if (/market|price|etf|trading|bull|bear|rally|crash|fund|invest/i.test(text))
    return "market";
  if (/regulation|sec|law|policy|ban|legal|cbdc|compliance|fda|government/i.test(text))
    return "regulation";
  if (/technology|upgrade|hack|security|defi|nft|layer|protocol|smart contract/i.test(text))
    return "technology";
  if (/adoption|retail|payment|accept|partner|launch|integration/i.test(text))
    return "adoption";
  return defaultCat;
}

/** Simple keyword-based sentiment */
function guessSentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();
  const positiveWords = /surge|rally|gain|approve|milestone|bullish|breakthrough|success|record|growth|soar|boost|partnership/;
  const negativeWords = /crash|hack|breach|ban|fraud|loss|decline|bearish|warning|scam|lawsuit|plunge|drop|fall/;

  const posScore = (lower.match(positiveWords) || []).length;
  const negScore = (lower.match(negativeWords) || []).length;

  if (posScore > negScore) return "positive";
  if (negScore > posScore) return "negative";
  return "neutral";
}

/** Extract tags from title */
function extractTags(title: string, categories: string[]): string[] {
  const tags = new Set<string>();

  // Add categories as tags
  categories.forEach((cat) => {
    if (cat && cat !== "Latest News") {
      tags.add(cat.toLowerCase().replace(/\s+/g, "-"));
    }
  });

  // Extract crypto mentions from title
  const cryptoMentions =
    /\b(bitcoin|btc|ethereum|eth|solana|sol|polygon|matic|xrp|dogecoin|doge|cardano|ada|polkadot|dot|defi|nft|web3|metaverse|stablecoin|cbdc)\b/gi;
  const matches = title.match(cryptoMentions);
  if (matches) {
    matches.forEach((m) => tags.add(m.toLowerCase()));
  }

  // Common topic tags
  if (/etf/i.test(title)) tags.add("etf");
  if (/sec|regulat/i.test(title)) tags.add("regulation");
  if (/hack|secur/i.test(title)) tags.add("security");
  if (/ai\b|artificial intelligence/i.test(title)) tags.add("ai");

  return Array.from(tags).slice(0, 5);
}

// ── In-memory cache (5 min TTL) ─────────────────────────────────────
interface CachedNews {
  articles: NewsArticle[];
  timestamp: number;
}
let cachedNews: CachedNews | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Core fetch ──────────────────────────────────────────────────────

async function fetchFeedArticles(feed: (typeof RSS_FEEDS)[0]): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      `${RSS2JSON_URL}?rss_url=${encodeURIComponent(feed.url)}`,
      { next: { revalidate: 300 } } // Next.js ISR: revalidate every 5 min
    );

    if (!res.ok) {
      console.warn(`[news] RSS fetch failed for ${feed.source}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data.status !== "ok" || !data.items) return [];

    return data.items.map((item: any, index: number): NewsArticle => {
      const rawDesc = item.description || item.content || "";
      const cleanDesc = stripHtml(rawDesc);
      const imageUrl = item.thumbnail || item.enclosure?.link || extractImageUrl(rawDesc);
      const categories: string[] = item.categories || [];
      const category = guessCategory(categories, item.title, feed.defaultCategory);

      return {
        id: `${feed.source.toLowerCase().replace(/\s/g, "-")}-${index}-${Date.now()}`,
        title: item.title || "Untitled",
        description: cleanDesc.substring(0, 300),
        content: cleanDesc,
        author: (item.author || feed.source).replace(/^.*by\s+/i, ""),
        source: feed.source,
        url: item.link || item.guid || "",
        imageUrl: imageUrl || undefined,
        category,
        tags: extractTags(item.title || "", categories),
        publishedAt: new Date(item.pubDate || Date.now()),
        sentiment: guessSentiment(item.title + " " + cleanDesc),
      };
    });
  } catch (err) {
    console.error(`[news] Error fetching ${feed.source}:`, err);
    return [];
  }
}

async function fetchAllNews(): Promise<NewsArticle[]> {
  // Return cache if valid
  if (cachedNews && Date.now() - cachedNews.timestamp < CACHE_TTL) {
    return cachedNews.articles;
  }

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeedArticles(feed))
  );

  const allArticles: NewsArticle[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  });

  // Sort by date (newest first) and deduplicate by title
  const seen = new Set<string>();
  const deduped = allArticles
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .filter((article) => {
      const key = article.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Re-assign stable IDs after dedup/sort
  deduped.forEach((article, i) => {
    article.id = `news-${i + 1}`;
  });

  cachedNews = { articles: deduped, timestamp: Date.now() };
  return deduped;
}

// ── Public API functions ────────────────────────────────────────────

/**
 * Get news articles with pagination and filtering
 */
export async function getNews(options: {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  sortBy?: "date" | "relevance";
}): Promise<PaginatedResponse<NewsArticle>> {
  try {
    const { page = 1, limit = 20, category, tags, sortBy = "date" } = options;
    let articles = await fetchAllNews();

    // Filter by category
    if (category) {
      articles = articles.filter((a) => a.category === category);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      articles = articles.filter((a) =>
        tags.some((tag) => a.tags.includes(tag))
      );
    }

    // Sort
    if (sortBy === "date") {
      articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }

    const total = articles.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = articles.slice(start, end);

    return {
      success: true,
      data: paginatedData,
      page,
      limit,
      total,
      hasMore: end < total,
    };
  } catch (error) {
    console.error("Get news error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get news",
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * Get a specific news article
 */
export async function getNewsArticle(
  articleId: string
): Promise<ApiResponse<NewsArticle>> {
  try {
    const articles = await fetchAllNews();
    const article = articles.find((a) => a.id === articleId);

    if (!article) {
      return { success: false, error: "Article not found" };
    }
    return { success: true, data: article };
  } catch (error) {
    console.error("Get news article error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get article",
    };
  }
}

/**
 * Get trending news (most recent with positive sentiment)
 */
export async function getTrendingNews(
  limit: number = 5
): Promise<ApiResponse<NewsArticle[]>> {
  try {
    const articles = await fetchAllNews();

    // Trending = recent + positive sentiment, fallback to just recent
    const positive = articles.filter((a) => a.sentiment === "positive");
    const trending = (positive.length >= limit ? positive : articles).slice(
      0,
      limit
    );

    return { success: true, data: trending };
  } catch (error) {
    console.error("Get trending news error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get trending news",
      data: [],
    };
  }
}

/**
 * Get news by category
 */
export async function getNewsByCategory(
  category: string,
  limit: number = 10
): Promise<ApiResponse<NewsArticle[]>> {
  try {
    const articles = await fetchAllNews();
    const filtered = articles
      .filter((a) => a.category === category)
      .slice(0, limit);

    return { success: true, data: filtered };
  } catch (error) {
    console.error("Get news by category error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get news by category",
      data: [],
    };
  }
}

/**
 * Search news articles
 */
export async function searchNews(
  query: string
): Promise<ApiResponse<NewsArticle[]>> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [], message: "Query too short" };
    }

    const articles = await fetchAllNews();
    const lowerQuery = query.toLowerCase();

    const results = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery) ||
        a.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("Search news error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search news",
      data: [],
    };
  }
}

/**
 * Get news categories
 */
export async function getNewsCategories(): Promise<
  ApiResponse<Array<{ name: string; count: number }>>
> {
  try {
    const articles = await fetchAllNews();
    const categories = new Map<string, number>();

    articles.forEach((article) => {
      const count = categories.get(article.category) || 0;
      categories.set(article.category, count + 1);
    });

    const result = Array.from(categories.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { success: true, data: result };
  } catch (error) {
    console.error("Get news categories error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get categories",
      data: [],
    };
  }
}

/**
 * Get popular tags
 */
export async function getPopularTags(
  limit: number = 20
): Promise<ApiResponse<Array<{ tag: string; count: number }>>> {
  try {
    const articles = await fetchAllNews();
    const tagCounts = new Map<string, number>();

    articles.forEach((article) => {
      article.tags.forEach((tag) => {
        const count = tagCounts.get(tag) || 0;
        tagCounts.set(tag, count + 1);
      });
    });

    const result = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { success: true, data: result };
  } catch (error) {
    console.error("Get popular tags error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get popular tags",
      data: [],
    };
  }
}
