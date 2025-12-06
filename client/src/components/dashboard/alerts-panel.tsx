import { 
  AlertTriangle, 
  CloudLightning, 
  CloudRain, 
  Droplets,
  Mountain,
  Wind 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { HazardAlert } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AlertsPanelProps {
  alerts: HazardAlert[];
  isLoading?: boolean;
}

function getAlertIcon(type: HazardAlert["type"]) {
  switch (type) {
    case "flood":
      return <Droplets className="h-4 w-4" />;
    case "storm":
      return <CloudLightning className="h-4 w-4" />;
    case "rainfall":
      return <CloudRain className="h-4 w-4" />;
    case "cyclone":
      return <Wind className="h-4 w-4" />;
    case "landslide":
      return <Mountain className="h-4 w-4" />;
  }
}

function getSeverityBadge(severity: HazardAlert["severity"]) {
  switch (severity) {
    case "advisory":
      return <Badge variant="secondary" className="text-xs">Advisory</Badge>;
    case "watch":
      return <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">Watch</Badge>;
    case "warning":
      return <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30">Warning</Badge>;
    case "emergency":
      return <Badge variant="destructive" className="text-xs">Emergency</Badge>;
  }
}

function AlertSkeleton() {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  const activeAlerts = alerts.filter(a => new Date(a.expiresAt) > new Date());

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Hazard Alerts
          </div>
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {activeAlerts.length} Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {isLoading ? (
              <>
                <AlertSkeleton />
                <AlertSkeleton />
              </>
            ) : activeAlerts.length === 0 ? (
              <div className="p-4 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 opacity-50" />
                  <span className="text-sm">No active alerts</span>
                  <span className="text-xs">All clear for Sri Lanka</span>
                </div>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  data-testid={`alert-card-${alert.id}`}
                  className="p-3 rounded-md bg-muted/30 hover-elevate active-elevate-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {getAlertIcon(alert.type)}
                      <span className="capitalize">{alert.type}</span>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm font-medium mb-1">{alert.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{alert.affectedAreas.slice(0, 2).join(", ")}</span>
                    <span>{formatDistanceToNow(new Date(alert.issuedAt), { addSuffix: true })}</span>
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
