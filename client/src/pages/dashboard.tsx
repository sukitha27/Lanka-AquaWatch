import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapComponent } from "@/components/dashboard/map-component";
import { WeatherLayerControls } from "@/components/dashboard/weather-layer-controls";
import { ForecastModeSwitch } from "@/components/dashboard/forecast-mode-switch";
import { RiverWaterLevels } from "@/components/dashboard/river-water-levels";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { NewsSection } from "@/components/dashboard/news-section";
import { EmergencyButton } from "@/components/dashboard/emergency-button";
import { RiskLegend } from "@/components/dashboard/risk-legend";
import { WeatherDisplay } from "@/components/dashboard/weather-display";
import { SearchLocation } from "@/components/dashboard/search-location";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Droplets, 
  Menu, 
  AlertTriangle, 
  Newspaper,
  MapPin
} from "lucide-react";
import type { 
  WeatherLayer, 
  ForecastMode, 
  RiverStation, 
  FloodRiskZone, 
  HazardAlert, 
  NewsItem,
  WeatherData,
  District
} from "@shared/schema";

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>("rainfall");
  const [forecastMode, setForecastMode] = useState<ForecastMode>("current");
  const [selectedStation, setSelectedStation] = useState<RiverStation | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: stations = [], isLoading: stationsLoading } = useQuery<RiverStation[]>({
    queryKey: ["/api/stations"],
  });

  const { data: riskZones = [] } = useQuery<FloodRiskZone[]>({
    queryKey: ["/api/risk-zones"],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<HazardAlert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: news = [], isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  const { data: weather, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather", forecastMode],
    queryFn: async () => {
      const res = await fetch(`/api/weather?mode=${forecastMode}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return res.json();
    },
  });

  const handleStationClick = (station: RiverStation) => {
    setSelectedStation(station);
  };

  const handleDistrictSelect = (district: District) => {
    const stationInDistrict = stations.find(s => s.district === district);
    if (stationInDistrict) {
      setSelectedStation(stationInDistrict);
    }
  };

  const activeAlerts = alerts.filter(a => new Date(a.expiresAt) > new Date());

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <header className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-card/50 backdrop-blur-sm z-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-chart-1" />
            <h1 className="text-base font-semibold hidden sm:block">
              Sri Lanka Flood Monitoring
            </h1>
            <h1 className="text-base font-semibold sm:hidden">
              Flood Monitor
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ForecastModeSwitch
            activeMode={forecastMode}
            onModeChange={setForecastMode}
            isLive={forecastMode === "current"}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <EmergencyButton />
          </div>
          <UserMenu />
          <ThemeToggle />
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] p-0" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <h2 className="font-semibold">Dashboard Menu</h2>
                </div>
                
                <div className="p-4 border-b md:hidden">
                  <ForecastModeSwitch
                    activeMode={forecastMode}
                    onModeChange={setForecastMode}
                    isLive={forecastMode === "current"}
                  />
                </div>

                <Tabs defaultValue="levels" className="flex-1 flex flex-col">
                  <TabsList className="w-full justify-start px-4 pt-2">
                    <TabsTrigger value="levels" className="gap-1">
                      <Droplets className="h-3 w-3" />
                      <span className="text-xs">Levels</span>
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Alerts</span>
                      {activeAlerts.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-destructive text-destructive-foreground rounded-full">
                          {activeAlerts.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="news" className="gap-1">
                      <Newspaper className="h-3 w-3" />
                      <span className="text-xs">News</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="levels" className="flex-1 mt-0 p-0">
                    <RiverWaterLevels
                      stations={stations}
                      isLoading={stationsLoading}
                      onStationClick={(station) => {
                        handleStationClick(station);
                        setMobileMenuOpen(false);
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="alerts" className="flex-1 mt-0 p-0">
                    <AlertsPanel alerts={alerts} isLoading={alertsLoading} />
                  </TabsContent>
                  
                  <TabsContent value="news" className="flex-1 mt-0 p-0">
                    <NewsSection news={news} isLoading={newsLoading} />
                  </TabsContent>
                </Tabs>

                <div className="p-4 border-t lg:hidden">
                  <EmergencyButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative">
          <MapComponent
            stations={stations}
            riskZones={riskZones}
            activeLayer={activeLayer}
            onStationClick={handleStationClick}
            selectedStation={selectedStation}
          />

          <div className="absolute top-4 left-4 z-10 w-64 hidden sm:block">
            <SearchLocation onDistrictSelect={handleDistrictSelect} />
          </div>

          <div className="absolute top-4 right-4 z-10">
            <WeatherLayerControls
              activeLayer={activeLayer}
              onLayerChange={setActiveLayer}
            />
          </div>

          <div className="absolute bottom-4 left-4 z-10 space-y-2">
            <RiskLegend />
            <div className="hidden sm:block">
              <WeatherDisplay weather={weather || null} isLoading={weatherLoading} />
            </div>
          </div>

          <div className="absolute bottom-4 right-20 z-10 sm:hidden">
            {selectedStation && (
              <div className="bg-card/90 backdrop-blur-sm rounded-md p-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-chart-1" />
                  <div>
                    <p className="text-xs font-medium">{selectedStation.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedStation.currentLevel.toFixed(1)}m
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden lg:flex flex-col w-80 border-l bg-card/30 backdrop-blur-sm">
          <Tabs defaultValue="levels" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-4 pt-3 bg-transparent">
              <TabsTrigger value="levels" className="gap-1.5">
                <Droplets className="h-3.5 w-3.5" />
                <span>Water Levels</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Alerts</span>
                {activeAlerts.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-destructive text-destructive-foreground rounded-full">
                    {activeAlerts.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="news" className="gap-1.5">
                <Newspaper className="h-3.5 w-3.5" />
                <span>News</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="levels" className="flex-1 m-0 p-0 overflow-hidden">
              <RiverWaterLevels
                stations={stations}
                isLoading={stationsLoading}
                onStationClick={handleStationClick}
              />
            </TabsContent>
            
            <TabsContent value="alerts" className="flex-1 m-0 p-0 overflow-hidden">
              <AlertsPanel alerts={alerts} isLoading={alertsLoading} />
            </TabsContent>
            
            <TabsContent value="news" className="flex-1 m-0 p-0 overflow-hidden">
              <NewsSection news={news} isLoading={newsLoading} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sm:hidden">
        <SearchLocation onDistrictSelect={handleDistrictSelect} />
      </div>
    </div>
  );
}
