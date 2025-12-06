import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  alertsEnabled: boolean("alerts_enabled").default(true),
  emailAlerts: boolean("email_alerts").default(false),
  warningThreshold: text("warning_threshold").default("warning"),
  preferredDistricts: text("preferred_districts").array(),
  theme: text("theme").default("system"),
});

export const favoriteLocations = pgTable("favorite_locations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  stationId: text("station_id").notNull(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const waterLevelHistory = pgTable("water_level_history", {
  id: serial("id").primaryKey(),
  stationId: text("station_id").notNull(),
  level: real("level").notNull(),
  status: text("status").notNull(),
  trend: text("trend").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

export const insertFavoriteLocationSchema = createInsertSchema(favoriteLocations).omit({
  id: true,
  createdAt: true,
});

export const insertWaterLevelHistorySchema = createInsertSchema(waterLevelHistory).omit({
  id: true,
  recordedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type FavoriteLocation = typeof favoriteLocations.$inferSelect;
export type InsertFavoriteLocation = z.infer<typeof insertFavoriteLocationSchema>;
export type WaterLevelHistory = typeof waterLevelHistory.$inferSelect;
export type InsertWaterLevelHistory = z.infer<typeof insertWaterLevelHistorySchema>;

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
