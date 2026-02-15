// News service - Get crypto news and updates
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

// In-memory storage for demo
const newsArticles: NewsArticle[] = [
  {
    id: "news-1",
    title: "Bitcoin Surges Past $50,000 as Institutional Interest Grows",
    description:
      "Bitcoin reached a new milestone today, breaking through the $50,000 barrier amid increased institutional adoption.",
    content:
      "Bitcoin has reached a significant milestone, surging past $50,000 for the first time in months. This rally comes amid growing institutional interest and positive regulatory developments...",
    author: "Sarah Johnson",
    source: "CryptoNews Daily",
    url: "https://example.com/news/bitcoin-50k",
    imageUrl:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800",
    category: "market",
    tags: ["bitcoin", "price", "institutions"],
    publishedAt: new Date("2024-02-15T10:30:00"),
    sentiment: "positive",
  },
  {
    id: "news-2",
    title: "Ethereum 2.0 Upgrade Shows Promising Results",
    description:
      "The latest Ethereum network upgrade demonstrates significant improvements in transaction speed and energy efficiency.",
    content:
      "Ethereum's transition to proof-of-stake continues to show impressive results. Network validators report increased efficiency and reduced energy consumption...",
    author: "Michael Chen",
    source: "Blockchain Today",
    url: "https://example.com/news/eth-upgrade",
    imageUrl:
      "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800",
    category: "technology",
    tags: ["ethereum", "upgrade", "pos"],
    publishedAt: new Date("2024-02-15T09:15:00"),
    sentiment: "positive",
  },
  {
    id: "news-3",
    title: "SEC Approves New Crypto ETF Applications",
    description:
      "The Securities and Exchange Commission has approved several new cryptocurrency ETF applications, opening doors for more institutional investment.",
    content:
      "In a significant move for the cryptocurrency industry, the SEC has approved multiple spot Bitcoin ETF applications from major financial institutions...",
    author: "Jennifer Martinez",
    source: "Financial Times Crypto",
    url: "https://example.com/news/sec-etf",
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    category: "regulation",
    tags: ["sec", "etf", "regulation"],
    publishedAt: new Date("2024-02-15T08:00:00"),
    sentiment: "positive",
  },
  {
    id: "news-4",
    title: "Major Retailer Announces Cryptocurrency Payment Integration",
    description:
      "Global retail giant announces plans to accept cryptocurrency payments across all stores worldwide.",
    content:
      "In a groundbreaking move, one of the world's largest retailers has announced it will begin accepting Bitcoin, Ethereum, and other major cryptocurrencies...",
    author: "David Lee",
    source: "Tech Adoption News",
    url: "https://example.com/news/retail-crypto",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    category: "adoption",
    tags: ["adoption", "payments", "retail"],
    publishedAt: new Date("2024-02-14T16:45:00"),
    sentiment: "positive",
  },
  {
    id: "news-5",
    title: "DeFi Protocol Experiences Security Breach",
    description:
      "A popular DeFi protocol reports unauthorized access, highlighting ongoing security concerns in the space.",
    content:
      "A major decentralized finance protocol has disclosed a security breach resulting in the unauthorized withdrawal of funds. The team is working with security experts...",
    author: "Alex Thompson",
    source: "DeFi Security Watch",
    url: "https://example.com/news/defi-breach",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
    category: "technology",
    tags: ["defi", "security", "breach"],
    publishedAt: new Date("2024-02-14T14:20:00"),
    sentiment: "negative",
  },
  {
    id: "news-6",
    title: "Central Bank Explores Digital Currency Initiative",
    description:
      "Major central bank announces research program for national digital currency implementation.",
    content:
      "The central bank has announced a comprehensive research and development program to explore the implementation of a central bank digital currency (CBDC)...",
    author: "Emma Wilson",
    source: "Central Banking Review",
    url: "https://example.com/news/cbdc-initiative",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    category: "regulation",
    tags: ["cbdc", "central-bank", "regulation"],
    publishedAt: new Date("2024-02-14T11:30:00"),
    sentiment: "neutral",
  },
];

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

    let filteredNews = [...newsArticles];

    // Filter by category
    if (category) {
      filteredNews = filteredNews.filter(
        (article) => article.category === category,
      );
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredNews = filteredNews.filter((article) =>
        tags.some((tag) => article.tags.includes(tag)),
      );
    }

    // Sort
    if (sortBy === "date") {
      filteredNews.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
      );
    }

    const total = filteredNews.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filteredNews.slice(start, end);

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
  articleId: string,
): Promise<ApiResponse<NewsArticle>> {
  try {
    const article = newsArticles.find((a) => a.id === articleId);

    if (!article) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    return {
      success: true,
      data: article,
    };
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
  limit: number = 5,
): Promise<ApiResponse<NewsArticle[]>> {
  try {
    const trending = newsArticles
      .filter((article) => article.sentiment === "positive")
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);

    return {
      success: true,
      data: trending,
    };
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
  limit: number = 10,
): Promise<ApiResponse<NewsArticle[]>> {
  try {
    const categoryNews = newsArticles
      .filter((article) => article.category === category)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);

    return {
      success: true,
      data: categoryNews,
    };
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
  query: string,
): Promise<ApiResponse<NewsArticle[]>> {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: [],
        message: "Query too short",
      };
    }

    const lowerQuery = query.toLowerCase();
    const results = newsArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );

    return {
      success: true,
      data: results,
    };
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
    const categories = new Map<string, number>();

    newsArticles.forEach((article) => {
      const count = categories.get(article.category) || 0;
      categories.set(article.category, count + 1);
    });

    const result = Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      success: true,
      data: result,
    };
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
  limit: number = 20,
): Promise<ApiResponse<Array<{ tag: string; count: number }>>> {
  try {
    const tagCounts = new Map<string, number>();

    newsArticles.forEach((article) => {
      article.tags.forEach((tag) => {
        const count = tagCounts.get(tag) || 0;
        tagCounts.set(tag, count + 1);
      });
    });

    const result = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return {
      success: true,
      data: result,
    };
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
