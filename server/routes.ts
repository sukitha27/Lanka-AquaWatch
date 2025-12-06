import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import type { WeatherData, WeatherForecast, ForecastMode } from "@shared/schema";

const SRI_LANKA_LAT = 7.8731;
const SRI_LANKA_LON = 80.7718;

interface WeatherCache {
  data: WeatherData | null;
  forecast: WeatherForecast[];
  lastFetched: number;
}

let weatherCache: WeatherCache = {
  data: null,
  forecast: [],
  lastFetched: 0
};

const CACHE_DURATION = 10 * 60 * 1000;

async function fetchWeatherData(): Promise<{ current: WeatherData; forecast: WeatherForecast[] }> {
  const now = Date.now();
  
  if (weatherCache.data && (now - weatherCache.lastFetched) < CACHE_DURATION) {
    return { current: weatherCache.data, forecast: weatherCache.forecast };
  }

  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${SRI_LANKA_LAT}&longitude=${SRI_LANKA_LON}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure&forecast_days=5&timezone=auto`
    );

    const data = response.data;
    
    const currentWeather: WeatherData = {
      latitude: data.latitude,
      longitude: data.longitude,
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      cloudCover: data.current.cloud_cover,
      pressure: data.current.surface_pressure,
      timestamp: data.current.time
    };

    const forecast: WeatherForecast[] = data.hourly.time.map((time: string, index: number) => ({
      time,
      temperature: data.hourly.temperature_2m[index],
      humidity: data.hourly.relative_humidity_2m[index],
      precipitation: data.hourly.precipitation[index],
      precipitationProbability: data.hourly.precipitation_probability[index],
      windSpeed: data.hourly.wind_speed_10m[index],
      windDirection: data.hourly.wind_direction_10m[index],
      cloudCover: data.hourly.cloud_cover[index],
      pressure: data.hourly.surface_pressure[index]
    }));

    weatherCache = {
      data: currentWeather,
      forecast,
      lastFetched: now
    };

    return { current: currentWeather, forecast };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    
    if (weatherCache.data) {
      return { current: weatherCache.data, forecast: weatherCache.forecast };
    }
    
    const fallbackWeather: WeatherData = {
      latitude: SRI_LANKA_LAT,
      longitude: SRI_LANKA_LON,
      temperature: 28.5,
      humidity: 78,
      precipitation: 2.5,
      windSpeed: 12.3,
      windDirection: 225,
      cloudCover: 65,
      pressure: 1008,
      timestamp: new Date().toISOString()
    };

    return { current: fallbackWeather, forecast: [] };
  }
}

function getForecastForMode(forecast: WeatherForecast[], mode: ForecastMode): WeatherData | null {
  if (!forecast.length) return null;

  const hoursOffset: Record<ForecastMode, number> = {
    current: 0,
    "24h": 24,
    "48h": 48,
    "72h": 72,
    "5days": 120
  };

  const targetIndex = Math.min(hoursOffset[mode], forecast.length - 1);
  const forecastData = forecast[targetIndex];

  if (!forecastData) return null;

  return {
    latitude: SRI_LANKA_LAT,
    longitude: SRI_LANKA_LON,
    temperature: forecastData.temperature,
    humidity: forecastData.humidity,
    precipitation: forecastData.precipitation,
    windSpeed: forecastData.windSpeed,
    windDirection: forecastData.windDirection,
    cloudCover: forecastData.cloudCover,
    pressure: forecastData.pressure,
    timestamp: forecastData.time
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/stations", async (req, res) => {
    try {
      const stations = await storage.getRiverStations();
      res.json(stations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ error: "Failed to fetch river stations" });
    }
  });

  app.get("/api/stations/:id", async (req, res) => {
    try {
      const station = await storage.getRiverStation(req.params.id);
      if (!station) {
        return res.status(404).json({ error: "Station not found" });
      }
      res.json(station);
    } catch (error) {
      console.error("Error fetching station:", error);
      res.status(500).json({ error: "Failed to fetch station" });
    }
  });

  app.get("/api/risk-zones", async (req, res) => {
    try {
      const zones = await storage.getFloodRiskZones();
      res.json(zones);
    } catch (error) {
      console.error("Error fetching risk zones:", error);
      res.status(500).json({ error: "Failed to fetch risk zones" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getHazardAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/weather", async (req, res) => {
    try {
      const mode = (req.query.mode as ForecastMode) || "current";
      const { current, forecast } = await fetchWeatherData();

      if (mode === "current") {
        res.json(current);
      } else {
        const forecastWeather = getForecastForMode(forecast, mode);
        res.json(forecastWeather || current);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const { forecast } = await fetchWeatherData();
      res.json(forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      res.status(500).json({ error: "Failed to fetch forecast data" });
    }
  });

  return httpServer;
}
