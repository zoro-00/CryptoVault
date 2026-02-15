"use client";

import { useEffect, useState } from "react";
import { CryptoHeader } from "@/components/crypto-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  TrendingUp,
  Newspaper,
  Calendar,
  Tag,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { NewsArticle } from "@/lib/api/news";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [popularTags, setPopularTags] = useState<
    Array<{ tag: string; count: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadNews();
    loadMetadata();
  }, [selectedCategory, currentPage]);

  const loadNews = async () => {
    setLoading(true);
    try {
      let url = `/api/news?page=${currentPage}&limit=10`;
      if (selectedCategory !== "all") {
        url = `/api/news?category=${selectedCategory}&page=${currentPage}&limit=10`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [trendingRes, categoriesRes, tagsRes] = await Promise.all([
        fetch("/api/news?trending=true&limit=5"),
        fetch("/api/news?type=categories"),
        fetch("/api/news?type=tags&limit=10"),
      ]);

      const [trendingData, categoriesData, tagsData] = await Promise.all([
        trendingRes.json(),
        categoriesRes.json(),
        tagsRes.json(),
      ]);

      if (trendingData.success) setTrendingArticles(trendingData.data || []);
      if (categoriesData.success) setCategories(categoriesData.data || []);
      if (tagsData.success) setPopularTags(tagsData.data || []);
    } catch (error) {
      console.error("Failed to load metadata:", error);
    }
  };

  const searchNews = async () => {
    if (!searchQuery.trim()) {
      loadNews();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/news?search=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
        if (data.data?.length === 0) {
          toast.info("No articles found");
        }
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "negative":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Crypto News
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest cryptocurrency news and market insights
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchNews()}
                />
                <Button onClick={searchNews}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main News Feed */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading articles...
              </div>
            ) : articles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Articles Found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search query.
                  </p>
                </CardContent>
              </Card>
            ) : (
              articles.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {article.imageUrl && (
                      <div className="md:w-64 h-48 md:h-auto bg-muted flex-shrink-0">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="secondary">
                                {article.category}
                              </Badge>
                              {article.sentiment && (
                                <Badge
                                  variant="outline"
                                  className={getSentimentColor(article.sentiment)}
                                >
                                  {article.sentiment}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl mb-2">
                              {article.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 text-sm">
                              <span>{article.source}</span>
                              <span>•</span>
                              <span>{formatDate(article.publishedAt.toString())}</span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 flex-wrap">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Read More
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {/* Pagination */}
            {articles.length > 0 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={articles.length < 10}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending News
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingArticles.map((article, idx) => (
                  <div
                    key={article.id}
                    className="border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline line-clamp-2"
                        >
                          {article.title}
                        </a>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{formatDate(article.publishedAt.toString())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag.tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        setSearchQuery(tag.tag);
                        searchNews();
                      }}
                    >
                      {tag.tag} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Categories
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.name}
                    variant={selectedCategory === cat.name ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    <span>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</span>
                    <Badge variant="secondary">{cat.count}</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
