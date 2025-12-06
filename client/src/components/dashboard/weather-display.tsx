import { 
  Cloud, 
  CloudRain, 
  Droplets, 
  Gauge, 
  Thermometer, 
  Wind,
  Navigation
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherData } from "@shared/schema";

interface WeatherDisplayProps {
  weather: WeatherData | null;
  isLoading?: boolean;
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function WeatherDisplay({ weather, isLoading }: WeatherDisplayProps) {
  if (isLoading) {
    return (
      <Card className="p-3 backdrop-blur-sm bg-card/90">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="p-3 backdrop-blur-sm bg-card/90">
        <p className="text-xs text-muted-foreground text-center">
          Select a location to view weather
        </p>
      </Card>
    );
  }

  const stats = [
    { 
      icon: Thermometer, 
      label: "Temperature", 
      value: `${weather.temperature.toFixed(1)}°C`,
      color: "text-orange-500"
    },
    { 
      icon: CloudRain, 
      label: "Precipitation", 
      value: `${weather.precipitation.toFixed(1)} mm`,
      color: "text-chart-1"
    },
    { 
      icon: Droplets, 
      label: "Humidity", 
      value: `${weather.humidity.toFixed(0)}%`,
      color: "text-chart-2"
    },
    { 
      icon: Wind, 
      label: "Wind", 
      value: `${weather.windSpeed.toFixed(1)} km/h`,
      suffix: (
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Navigation 
            className="h-3 w-3" 
            style={{ transform: `rotate(${weather.windDirection}deg)` }}
          />
          {getWindDirection(weather.windDirection)}
        </span>
      ),
      color: "text-chart-4"
    },
    { 
      icon: Cloud, 
      label: "Cloud Cover", 
      value: `${weather.cloudCover.toFixed(0)}%`,
      color: "text-muted-foreground"
    },
    { 
      icon: Gauge, 
      label: "Pressure", 
      value: `${weather.pressure.toFixed(0)} hPa`,
      color: "text-chart-5"
    },
  ];

  return (
    <Card className="p-3 backdrop-blur-sm bg-card/90" data-testid="weather-display">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value, suffix, color }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-mono font-semibold">{value}</p>
                {suffix}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
