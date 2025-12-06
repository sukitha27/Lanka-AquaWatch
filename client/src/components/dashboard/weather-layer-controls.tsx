import { 
  Cloud, 
  CloudRain, 
  Droplets, 
  Gauge, 
  Thermometer, 
  Wind 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { WeatherLayer } from "@shared/schema";

interface WeatherLayerControlsProps {
  activeLayer: WeatherLayer;
  onLayerChange: (layer: WeatherLayer) => void;
}

const layers: { id: WeatherLayer; label: string; icon: typeof CloudRain }[] = [
  { id: "rainfall", label: "Rainfall", icon: CloudRain },
  { id: "wind", label: "Wind", icon: Wind },
  { id: "temperature", label: "Temperature", icon: Thermometer },
  { id: "humidity", label: "Humidity", icon: Droplets },
  { id: "clouds", label: "Clouds", icon: Cloud },
  { id: "pressure", label: "Pressure", icon: Gauge },
];

export function WeatherLayerControls({ 
  activeLayer, 
  onLayerChange 
}: WeatherLayerControlsProps) {
  return (
    <Card className="p-2 backdrop-blur-sm bg-card/90">
      <div className="grid grid-cols-3 gap-1">
        {layers.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeLayer === id ? "default" : "ghost"}
                size="icon"
                data-testid={`button-layer-${id}`}
                onClick={() => onLayerChange(id)}
                className={`toggle-elevate ${activeLayer === id ? "toggle-elevated" : ""}`}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </Card>
  );
}
