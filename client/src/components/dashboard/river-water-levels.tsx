import { 
  ArrowDown, 
  ArrowRight, 
  ArrowUp, 
  Droplets,
  MapPin 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiverStation } from "@shared/schema";

interface RiverWaterLevelsProps {
  stations: RiverStation[];
  isLoading?: boolean;
  onStationClick?: (station: RiverStation) => void;
}

function getTrendIcon(trend: RiverStation["trend"]) {
  switch (trend) {
    case "rising":
      return <ArrowUp className="h-3 w-3 text-destructive" />;
    case "falling":
      return <ArrowDown className="h-3 w-3 text-chart-3" />;
    case "stable":
      return <ArrowRight className="h-3 w-3 text-muted-foreground" />;
  }
}

function getStatusBadge(status: RiverStation["status"]) {
  switch (status) {
    case "normal":
      return <Badge variant="secondary" className="text-xs bg-chart-3/20 text-chart-3 border-chart-3/30">Normal</Badge>;
    case "warning":
      return <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">Warning</Badge>;
    case "danger":
      return <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30">Danger</Badge>;
    case "critical":
      return <Badge variant="destructive" className="text-xs">Critical</Badge>;
  }
}

function StationSkeleton() {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function RiverWaterLevels({ 
  stations, 
  isLoading,
  onStationClick 
}: RiverWaterLevelsProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-4 w-4 text-chart-1" />
          River Water Levels
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {isLoading ? (
              <>
                <StationSkeleton />
                <StationSkeleton />
                <StationSkeleton />
              </>
            ) : stations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No river stations data available
              </div>
            ) : (
              stations.map((station) => (
                <div
                  key={station.id}
                  data-testid={`station-card-${station.id}`}
                  onClick={() => onStationClick?.(station)}
                  className="p-3 rounded-md bg-muted/30 hover-elevate active-elevate-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{station.name}</span>
                    {getStatusBadge(station.status)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{station.district}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-semibold">
                        {station.currentLevel.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">m</span>
                      {getTrendIcon(station.trend)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Normal: {station.normalLevel.toFixed(1)}m
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
