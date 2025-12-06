import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type WeatherLayer = 
  | "rainfall" 
  | "wind" 
  | "temperature" 
  | "humidity" 
  | "clouds" 
  | "pressure";

export type ForecastMode = 
  | "current" 
  | "24h" 
  | "48h" 
  | "72h" 
  | "5days";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiverStation {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  currentLevel: number;
  normalLevel: number;
  warningLevel: number;
  dangerLevel: number;
  trend: "rising" | "falling" | "stable";
  lastUpdated: string;
  status: "normal" | "warning" | "danger" | "critical";
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  pressure: number;
  timestamp: string;
}

export interface WeatherForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  pressure: number;
}

export interface FloodRiskZone {
  id: string;
  name: string;
  district: string;
  riskLevel: RiskLevel;
  coordinates: [number, number][];
  affectedPopulation?: number;
  lastAssessed: string;
}

export interface HazardAlert {
  id: string;
  type: "flood" | "storm" | "rainfall" | "cyclone" | "landslide";
  severity: "advisory" | "watch" | "warning" | "emergency";
  title: string;
  description: string;
  affectedAreas: string[];
  issuedAt: string;
  expiresAt: string;
  source: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  category: "weather" | "flood" | "disaster" | "general";
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const SRI_LANKA_BOUNDS: MapBounds = {
  north: 9.9,
  south: 5.9,
  east: 82.0,
  west: 79.5
};

export const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];

export const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
] as const;

export type District = typeof DISTRICTS[number];
