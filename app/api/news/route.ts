import { NextRequest, NextResponse } from "next/server";
import {
  getNews,
  getNewsArticle,
  getTrendingNews,
  getNewsByCategory,
  searchNews,
  getNewsCategories,
  getPopularTags,
} from "@/lib/api/news";

// GET /api/news - Get news articles
// GET /api/news?id=xxx - Get specific article
// GET /api/news?trending=true - Get trending news
// GET /api/news?category=market - Get news by category
// GET /api/news?search=bitcoin - Search news
// GET /api/news?type=categories - Get categories
// GET /api/news?type=tags - Get popular tags
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get("id");
    const trending = searchParams.get("trending") === "true";
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("search");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const sortBy = (searchParams.get("sortBy") as any) || "date";

    // Get specific article
    if (articleId) {
      const result = await getNewsArticle(articleId);
      return NextResponse.json(result, {
        status: result.success ? 200 : 404,
      });
    }

    // Get trending news
    if (trending) {
      const result = await getTrendingNews(limit);
      return NextResponse.json(result);
    }

    // Get categories
    if (type === "categories") {
      const result = await getNewsCategories();
      return NextResponse.json(result);
    }

    // Get popular tags
    if (type === "tags") {
      const result = await getPopularTags(limit);
      return NextResponse.json(result);
    }

    // Search news
    if (searchQuery) {
      const result = await searchNews(searchQuery);
      return NextResponse.json(result);
    }

    // Get news by category
    if (category) {
      const result = await getNewsByCategory(category, limit);
      return NextResponse.json(result);
    }

    // Get all news with pagination
    const result = await getNews({ page, limit, tags, sortBy });
    return NextResponse.json(result);
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
