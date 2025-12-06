import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { SRI_LANKA_CENTER, type RiverStation, type FloodRiskZone, type WeatherLayer } from "@shared/schema";

interface MapComponentProps {
  stations: RiverStation[];
  riskZones: FloodRiskZone[];
  activeLayer: WeatherLayer;
  onStationClick?: (station: RiverStation) => void;
  selectedStation?: RiverStation | null;
}

function createStationIcon(status: RiverStation["status"]) {
  const colors = {
    normal: "#10b981",
    warning: "#eab308",
    danger: "#f97316",
    critical: "#ef4444"
  };
  
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style="background-color: ${colors[status]}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
        ${status === "critical" ? `
          <div class="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full animate-ping opacity-75" style="background-color: ${colors[status]}"></div>
        ` : ""}
      </div>
    `,
    className: "custom-station-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function getRiskColor(level: FloodRiskZone["riskLevel"]) {
  switch (level) {
    case "low": return { color: "#10b981", fillOpacity: 0.2 };
    case "medium": return { color: "#eab308", fillOpacity: 0.3 };
    case "high": return { color: "#f97316", fillOpacity: 0.4 };
    case "critical": return { color: "#ef4444", fillOpacity: 0.5 };
  }
}

function MapController({ selectedStation }: { selectedStation?: RiverStation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
        duration: 1
      });
    }
  }, [selectedStation, map]);
  
  return null;
}

export function MapComponent({ 
  stations, 
  riskZones, 
  activeLayer,
  onStationClick,
  selectedStation 
}: MapComponentProps) {
  const mapRef = useRef<L.Map>(null);

  const weatherLayerUrl = useMemo(() => {
    const layerTypes: Record<WeatherLayer, string> = {
      rainfall: "precipitation_new",
      wind: "wind_new",
      temperature: "temp_new",
      humidity: "humidity_new",
      clouds: "clouds_new",
      pressure: "pressure_new"
    };
    return `https://tile.openweathermap.org/map/${layerTypes[activeLayer]}/{z}/{x}/{y}.png?appid=demo`;
  }, [activeLayer]);

  return (
    <div className="w-full h-full relative" data-testid="map-container">
      <MapContainer
        ref={mapRef}
        center={SRI_LANKA_CENTER}
        zoom={8}
        className="w-full h-full z-0"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <TileLayer
          url={weatherLayerUrl}
          opacity={0.6}
        />

        {riskZones.map((zone) => {
          const { color, fillOpacity } = getRiskColor(zone.riskLevel);
          const center = zone.coordinates.reduce(
            (acc, coord) => [acc[0] + coord[0] / zone.coordinates.length, acc[1] + coord[1] / zone.coordinates.length],
            [0, 0]
          );
          return (
            <Circle
              key={zone.id}
              center={[center[0], center[1]]}
              radius={15000}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-semibold text-sm">{zone.name}</p>
                  <p className="text-xs text-gray-600">{zone.district}</p>
                  <p className="text-xs mt-1 capitalize">
                    Risk Level: <span className="font-medium">{zone.riskLevel}</span>
                  </p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={createStationIcon(station.status)}
            eventHandlers={{
              click: () => onStationClick?.(station)
            }}
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                <p className="font-semibold text-sm">{station.name}</p>
                <p className="text-xs text-gray-600 mb-2">{station.district}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Current Level:</span>
                    <span className="font-mono font-semibold">{station.currentLevel.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Normal Level:</span>
                    <span className="font-mono">{station.normalLevel.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Warning Level:</span>
                    <span className="font-mono text-yellow-600">{station.warningLevel.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Danger Level:</span>
                    <span className="font-mono text-red-600">{station.dangerLevel.toFixed(1)}m</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  Last updated: {new Date(station.lastUpdated).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <ZoomControl position="bottomright" />
        <MapController selectedStation={selectedStation} />
      </MapContainer>
    </div>
  );
}
