import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";
import { 
  users, 
  userPreferences, 
  favoriteLocations, 
  waterLevelHistory,
  type User, 
  type InsertUser, 
  type UserPreferences,
  type InsertUserPreferences,
  type FavoriteLocation,
  type InsertFavoriteLocation,
  type WaterLevelHistory,
  type InsertWaterLevelHistory,
  type RiverStation, 
  type FloodRiskZone, 
  type HazardAlert, 
  type NewsItem
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, prefs: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  
  getFavoriteLocations(userId: string): Promise<FavoriteLocation[]>;
  addFavoriteLocation(fav: InsertFavoriteLocation): Promise<FavoriteLocation>;
  removeFavoriteLocation(id: number, userId: string): Promise<boolean>;
  
  getWaterLevelHistory(stationId: string, hours?: number): Promise<WaterLevelHistory[]>;
  recordWaterLevel(record: InsertWaterLevelHistory): Promise<WaterLevelHistory>;
  
  getRiverStations(): Promise<RiverStation[]>;
  getRiverStation(id: string): Promise<RiverStation | undefined>;
  
  getFloodRiskZones(): Promise<FloodRiskZone[]>;
  
  getHazardAlerts(): Promise<HazardAlert[]>;
  
  getNews(): Promise<NewsItem[]>;
}

const sriLankaRiverStations: RiverStation[] = [
  {
    id: "kelani-hanwella",
    name: "Kelani Ganga - Hanwella",
    district: "Colombo",
    latitude: 6.9106,
    longitude: 80.0868,
    currentLevel: 3.2,
    normalLevel: 2.5,
    warningLevel: 4.0,
    dangerLevel: 5.5,
    trend: "stable",
    lastUpdated: new Date().toISOString(),
    status: "normal"
  },
  {
    id: "kelani-nagalagam",
    name: "Kelani Ganga - Nagalagam Street",
    district: "Colombo",
    latitude: 6.9494,
    longitude: 79.8776,
    currentLevel: 2.8,
    normalLevel: 2.0,
    warningLevel: 3.5,
    dangerLevel: 4.8,
    trend: "rising",
    lastUpdated: new Date().toISOString(),
    status: "normal"
  },
  {
    id: "kalu-ratnapura",
    name: "Kalu Ganga - Ratnapura",
    district: "Ratnapura",
    latitude: 6.6804,
    longitude: 80.4036,
    currentLevel: 5.1,
    normalLevel: 3.5,
    warningLevel: 5.0,
    dangerLevel: 6.5,
    trend: "rising",
    lastUpdated: new Date().toISOString(),
    status: "warning"
  },
  {
    id: "kalu-putupaula",
    name: "Kalu Ganga - Putupaula",
    district: "Kalutara",
    latitude: 6.5774,
    longitude: 80.1050,
    currentLevel: 4.2,
    normalLevel: 3.0,
    warningLevel: 4.5,
    dangerLevel: 5.8,
    trend: "stable",
    lastUpdated: new Date().toISOString(),
    status: "normal"
  },
  {
    id: "mahaweli-peradeniya",
    name: "Mahaweli Ganga - Peradeniya",
    district: "Kandy",
    latitude: 7.2681,
    longitude: 80.5955,
    currentLevel: 2.9,
    normalLevel: 2.2,
    warningLevel: 3.8,
    dangerLevel: 5.0,
    trend: "falling",
    lastUpdated: new Date().toISOString(),
    status: "normal"
  },
  {
    id: "nilwala-akuressa",
    name: "Nilwala Ganga - Akuressa",
    district: "Matara",
    latitude: 5.9676,
    longitude: 80.4690,
    currentLevel: 3.8,
    normalLevel: 2.8,
    warningLevel: 4.0,
    dangerLevel: 5.2,
    trend: "rising",
    lastUpdated: new Date().toISOString(),
    status: "warning"
  },
  {
    id: "gin-baddegama",
    name: "Gin Ganga - Baddegama",
    district: "Galle",
    latitude: 6.1862,
    longitude: 80.1986,
    currentLevel: 2.5,
    normalLevel: 2.0,
    warningLevel: 3.2,
    dangerLevel: 4.5,
    trend: "stable",
    lastUpdated: new Date().toISOString(),
    status: "normal"
  },
  {
    id: "attanagalu-dunamale",
    name: "Attanagalu Oya - Dunamale",
    district: "Gampaha",
    latitude: 7.1088,
    longitude: 79.9954,
    currentLevel: 6.2,
    normalLevel: 4.0,
    warningLevel: 5.5,
    dangerLevel: 6.0,
    trend: "rising",
    lastUpdated: new Date().toISOString(),
    status: "danger"
  },
  {
    id: "deduru-chilaw",
    name: "Deduru Oya - Chilaw",
    district: "Puttalam",
    latitude: 7.5751,
    longitude: 79.7956,
    currentLevel: 2.1,
    normalLevel: 1.8,
    warningLevel: 3.0,
    dangerLevel: 4.2,
    trend: "stable",
    lastUpdated: new Date().toISOString(),
    status: "normal"
  },
  {
    id: "walawe-embilipitiya",
    name: "Walawe Ganga - Embilipitiya",
    district: "Ratnapura",
    latitude: 6.3384,
    longitude: 80.8498,
    currentLevel: 3.0,
    normalLevel: 2.5,
    warningLevel: 3.8,
    dangerLevel: 5.0,
    trend: "falling",
    lastUpdated: new Date().toISOString(),
    status: "normal"
  }
];

const floodRiskZones: FloodRiskZone[] = [
  {
    id: "colombo-low",
    name: "Western Lowlands",
    district: "Colombo",
    riskLevel: "medium",
    coordinates: [[6.9271, 79.8612], [6.9400, 79.8800], [6.9100, 79.8900]],
    affectedPopulation: 250000,
    lastAssessed: new Date().toISOString()
  },
  {
    id: "ratnapura-basin",
    name: "Kalu Ganga Basin",
    district: "Ratnapura",
    riskLevel: "high",
    coordinates: [[6.6804, 80.4036], [6.7000, 80.4200], [6.6600, 80.4300]],
    affectedPopulation: 85000,
    lastAssessed: new Date().toISOString()
  },
  {
    id: "gampaha-flood",
    name: "Attanagalu Flood Plain",
    district: "Gampaha",
    riskLevel: "critical",
    coordinates: [[7.1088, 79.9954], [7.1200, 80.0100], [7.0900, 80.0200]],
    affectedPopulation: 120000,
    lastAssessed: new Date().toISOString()
  },
  {
    id: "kalutara-coastal",
    name: "Kalutara Coastal Zone",
    district: "Kalutara",
    riskLevel: "medium",
    coordinates: [[6.5833, 79.9607], [6.6000, 79.9800], [6.5600, 79.9700]],
    affectedPopulation: 65000,
    lastAssessed: new Date().toISOString()
  },
  {
    id: "matara-nilwala",
    name: "Nilwala Basin",
    district: "Matara",
    riskLevel: "high",
    coordinates: [[5.9485, 80.5353], [5.9600, 80.5500], [5.9300, 80.5400]],
    affectedPopulation: 75000,
    lastAssessed: new Date().toISOString()
  },
  {
    id: "galle-lowlands",
    name: "Galle Lowlands",
    district: "Galle",
    riskLevel: "low",
    coordinates: [[6.0535, 80.2210], [6.0700, 80.2400], [6.0400, 80.2300]],
    affectedPopulation: 45000,
    lastAssessed: new Date().toISOString()
  }
];

const hazardAlerts: HazardAlert[] = [
  {
    id: "alert-1",
    type: "rainfall",
    severity: "warning",
    title: "Heavy Rainfall Warning - Western Province",
    description: "Heavy rainfall expected in Western Province with precipitation exceeding 100mm in 24 hours. Flash floods possible in low-lying areas.",
    affectedAreas: ["Colombo", "Gampaha", "Kalutara"],
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    source: "Department of Meteorology"
  },
  {
    id: "alert-2",
    type: "flood",
    severity: "watch",
    title: "Flood Watch - Kalu Ganga Basin",
    description: "Water levels rising in Kalu Ganga. Residents in low-lying areas should remain vigilant and prepare for possible evacuation.",
    affectedAreas: ["Ratnapura", "Kalutara"],
    issuedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    source: "Irrigation Department"
  },
  {
    id: "alert-3",
    type: "flood",
    severity: "emergency",
    title: "Flood Emergency - Attanagalu Oya",
    description: "Danger level exceeded at Dunamale station. Immediate evacuation recommended for residents in flood-prone areas.",
    affectedAreas: ["Gampaha"],
    issuedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    source: "Disaster Management Center"
  },
  {
    id: "alert-4",
    type: "landslide",
    severity: "advisory",
    title: "Landslide Risk - Central Highlands",
    description: "Increased landslide risk due to saturated soil conditions. Residents in hilly areas should monitor local conditions.",
    affectedAreas: ["Kandy", "Nuwara Eliya", "Badulla"],
    issuedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    source: "National Building Research Organisation"
  }
];

const newsItems: NewsItem[] = [
  {
    id: "news-1",
    title: "Southwest Monsoon Intensifies Over Sri Lanka",
    summary: "The Department of Meteorology reports intensified monsoon activity bringing heavy rainfall to southwestern regions. Multiple districts placed on high alert.",
    source: "Daily News",
    url: "https://www.dailynews.lk",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    category: "weather"
  },
  {
    id: "news-2",
    title: "Disaster Management Center Activates Emergency Response",
    summary: "DMC has activated emergency response protocols in Western and Sabaragamuwa provinces due to rising water levels in major rivers.",
    source: "Ada Derana",
    url: "https://www.adaderana.lk",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    category: "flood"
  },
  {
    id: "news-3",
    title: "Schools Closed in Gampaha District Due to Flooding",
    summary: "Education authorities have ordered closure of schools in flood-affected areas of Gampaha district as a precautionary measure.",
    source: "News First",
    url: "https://www.newsfirst.lk",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: "disaster"
  },
  {
    id: "news-4",
    title: "Relief Operations Underway in Ratnapura",
    summary: "Government relief teams and volunteers are providing assistance to families affected by flooding in Ratnapura district.",
    source: "Sunday Times",
    url: "https://www.sundaytimes.lk",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: "disaster"
  },
  {
    id: "news-5",
    title: "Weather Update: Rain to Continue for Next 48 Hours",
    summary: "Meteorological department forecasts continued rainfall across the island with particularly heavy precipitation expected in southwestern regions.",
    source: "Daily Mirror",
    url: "https://www.dailymirror.lk",
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    category: "weather"
  }
];

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const [result] = await db.insert(userPreferences).values(prefs).returning();
    return result;
  }

  async updateUserPreferences(userId: string, prefs: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const [result] = await db.update(userPreferences)
      .set(prefs)
      .where(eq(userPreferences.userId, userId))
      .returning();
    return result;
  }

  async getFavoriteLocations(userId: string): Promise<FavoriteLocation[]> {
    return db.select().from(favoriteLocations).where(eq(favoriteLocations.userId, userId));
  }

  async addFavoriteLocation(fav: InsertFavoriteLocation): Promise<FavoriteLocation> {
    const [result] = await db.insert(favoriteLocations).values(fav).returning();
    return result;
  }

  async removeFavoriteLocation(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(favoriteLocations)
      .where(and(eq(favoriteLocations.id, id), eq(favoriteLocations.userId, userId)));
    return true;
  }

  async getWaterLevelHistory(stationId: string, hours: number = 24): Promise<WaterLevelHistory[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select()
      .from(waterLevelHistory)
      .where(and(
        eq(waterLevelHistory.stationId, stationId),
        gte(waterLevelHistory.recordedAt, since)
      ))
      .orderBy(desc(waterLevelHistory.recordedAt));
  }

  async recordWaterLevel(record: InsertWaterLevelHistory): Promise<WaterLevelHistory> {
    const [result] = await db.insert(waterLevelHistory).values(record).returning();
    return result;
  }

  async getRiverStations(): Promise<RiverStation[]> {
    return sriLankaRiverStations.map(station => ({
      ...station,
      lastUpdated: new Date().toISOString()
    }));
  }

  async getRiverStation(id: string): Promise<RiverStation | undefined> {
    return sriLankaRiverStations.find(s => s.id === id);
  }

  async getFloodRiskZones(): Promise<FloodRiskZone[]> {
    return floodRiskZones;
  }

  async getHazardAlerts(): Promise<HazardAlert[]> {
    return hazardAlerts;
  }

  async getNews(): Promise<NewsItem[]> {
    return newsItems;
  }
}

export const storage = new DatabaseStorage();
