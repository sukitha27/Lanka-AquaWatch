import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RiskLevel } from "@shared/schema";

interface RiskLevelConfig {
  level: RiskLevel;
  label: string;
  color: string;
  description: string;
}

const riskLevels: RiskLevelConfig[] = [
  { 
    level: "low", 
    label: "Low", 
    color: "bg-chart-3",
    description: "Minimal flood risk. Normal conditions." 
  },
  { 
    level: "medium", 
    label: "Medium", 
    color: "bg-yellow-500",
    description: "Moderate risk. Monitor water levels." 
  },
  { 
    level: "high", 
    label: "High", 
    color: "bg-orange-500",
    description: "High risk. Take precautions." 
  },
  { 
    level: "critical", 
    label: "Critical", 
    color: "bg-destructive",
    description: "Immediate danger. Evacuate if advised." 
  },
];

export function RiskLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="backdrop-blur-sm bg-card/90 overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        data-testid="button-toggle-legend"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between px-3 py-2 h-auto"
      >
        <span className="text-xs font-medium">Flood Risk Legend</span>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {riskLevels.map(({ level, label, color, description }) => (
            <div 
              key={level} 
              className="flex items-center gap-2"
              data-testid={`legend-item-${level}`}
            >
              <div className={`w-4 h-4 rounded ${color}`} />
              <span className="text-xs font-medium flex-1">{label}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs max-w-[200px]">{description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
