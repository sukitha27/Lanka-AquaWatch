import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ForecastMode } from "@shared/schema";

interface ForecastModeSwitchProps {
  activeMode: ForecastMode;
  onModeChange: (mode: ForecastMode) => void;
  isLive?: boolean;
}

const modes: { id: ForecastMode; label: string; shortLabel: string }[] = [
  { id: "current", label: "Current", shortLabel: "Now" },
  { id: "24h", label: "+24 Hours", shortLabel: "+24h" },
  { id: "48h", label: "+48 Hours", shortLabel: "+48h" },
  { id: "72h", label: "+72 Hours", shortLabel: "+72h" },
  { id: "5days", label: "+5 Days", shortLabel: "+5d" },
];

export function ForecastModeSwitch({ 
  activeMode, 
  onModeChange,
  isLive = true 
}: ForecastModeSwitchProps) {
  return (
    <Card className="p-2 backdrop-blur-sm bg-card/90">
      <div className="flex items-center gap-2">
        {isLive && activeMode === "current" && (
          <Badge variant="default" className="gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
            </span>
            <span className="text-xs">LIVE</span>
          </Badge>
        )}
        <div className="flex items-center gap-1 flex-wrap">
          {modes.map(({ id, label, shortLabel }) => (
            <Button
              key={id}
              variant={activeMode === id ? "default" : "ghost"}
              size="sm"
              data-testid={`button-forecast-${id}`}
              onClick={() => onModeChange(id)}
              className={`text-xs toggle-elevate ${activeMode === id ? "toggle-elevated" : ""}`}
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
