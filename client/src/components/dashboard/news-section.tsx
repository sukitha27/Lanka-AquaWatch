import { ExternalLink, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { NewsItem } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface NewsSectionProps {
  news: NewsItem[];
  isLoading?: boolean;
}

function getCategoryBadge(category: NewsItem["category"]) {
  switch (category) {
    case "weather":
      return <Badge variant="secondary" className="text-xs">Weather</Badge>;
    case "flood":
      return <Badge variant="secondary" className="text-xs bg-chart-1/20 text-chart-1 border-chart-1/30">Flood</Badge>;
    case "disaster":
      return <Badge variant="destructive" className="text-xs">Disaster</Badge>;
    case "general":
      return <Badge variant="secondary" className="text-xs">General</Badge>;
  }
}

function NewsSkeleton() {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function NewsSection({ news, isLoading }: NewsSectionProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-chart-2" />
          News & Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {isLoading ? (
              <>
                <NewsSkeleton />
                <NewsSkeleton />
                <NewsSkeleton />
              </>
            ) : news.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No news available
              </div>
            ) : (
              news.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`news-card-${item.id}`}
                  className="block p-3 rounded-md bg-muted/30 hover-elevate active-elevate-2"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium line-clamp-1">{item.title}</span>
                    {getCategoryBadge(item.category)}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {item.source}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                    <span>{formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
