import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import bcrypt from "bcryptjs";
import type { WeatherData, WeatherForecast, ForecastMode, InsertUser, InsertUserPreferences, InsertFavoriteLocation, InsertWaterLevelHistory } from "@shared/schema";
import { insertUserSchema, insertFavoriteLocationSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

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

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.errors });
      }

      const { username, password, email } = result.data;

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword, email });

      await storage.createUserPreferences({ userId: user.id });

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/user/preferences", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const prefs = await storage.getUserPreferences(req.session.userId);
      res.json(prefs || { alertsEnabled: true, emailAlerts: false, warningThreshold: "warning", theme: "system" });
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.patch("/api/user/preferences", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const prefs = await storage.updateUserPreferences(req.session.userId, req.body);
      res.json(prefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  app.get("/api/user/favorites", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const favorites = await storage.getFavoriteLocations(req.session.userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/user/favorites", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const favorite = await storage.addFavoriteLocation({
        ...req.body,
        userId: req.session.userId
      });
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/user/favorites/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      await storage.removeFavoriteLocation(parseInt(req.params.id), req.session.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/stations/:id/history", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const history = await storage.getWaterLevelHistory(req.params.id, hours);
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch water level history" });
    }
  });

  app.post("/api/stations/:id/record", async (req, res) => {
    try {
      const station = await storage.getRiverStation(req.params.id);
      if (!station) {
        return res.status(404).json({ error: "Station not found" });
      }

      const record = await storage.recordWaterLevel({
        stationId: req.params.id,
        level: station.currentLevel,
        status: station.status,
        trend: station.trend
      });
      res.json(record);
    } catch (error) {
      console.error("Error recording water level:", error);
      res.status(500).json({ error: "Failed to record water level" });
    }
  });

  return httpServer;
}
