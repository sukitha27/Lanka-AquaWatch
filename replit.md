# Sri Lanka Flood Monitoring Dashboard

## Overview

A real-time flood monitoring and weather visualization dashboard for Sri Lanka. The application provides interactive maps showing river water levels, weather forecasts, flood risk zones, disaster alerts, and emergency news. Users can track current conditions and multi-day forecasts to make informed decisions about flood risks.

The dashboard features a map-first interface inspired by Windy.app's weather visualization approach, prioritizing information density and immediate data access over decorative elements. All critical flood and weather information is accessible through overlay panels and controls positioned around a full-screen interactive map.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant)
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Custom color scheme with HSL variables for theme support (light/dark modes)
- Typography: Inter for UI text, JetBrains Mono for numerical data
- Compact spacing system (Tailwind units: 1, 2, 4, 6, 8) for data-dense layouts
- Elevation system using shadows and backdrop blur for overlay components

**State Management:**
- React Context for authentication state and theme preferences
- TanStack Query for caching weather data, station information, and alerts
- Local component state for UI interactions (layer selection, forecast mode)

**Map Visualization:**
- Leaflet for interactive map rendering
- React-Leaflet for React integration
- Custom map markers with status-based styling (normal/warning/danger/critical)
- Overlay circles for flood risk zones with opacity-based severity indication

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- HTTP server for standard request handling
- Session-based authentication using express-session

**API Design:**
- RESTful endpoints for data retrieval
- Session cookies for authentication state
- JSON response format throughout

**Authentication:**
- bcryptjs for password hashing
- Session storage using PostgreSQL (connect-pg-simple)
- Cookie-based session management with secure flags in production

**Data Layer:**
- In-memory mock data for river stations, flood risk zones, and alerts
- Weather data fetched from Open-Meteo API with 10-minute caching
- Structured storage interface defined but currently using in-memory implementation

**Build Process:**
- esbuild for server bundling (reduces cold start times)
- Vite for client bundling
- Separate build outputs: `dist/index.cjs` (server), `dist/public` (client)
- Development mode uses Vite middleware for HMR

### Database Schema (Drizzle ORM)

**Schema Design:**
- PostgreSQL as the target database dialect
- Drizzle ORM for type-safe database queries
- Schema-first approach with Zod validation integration

**Core Tables:**
1. `users` - User accounts with UUID primary keys, username/password/email
2. `user_preferences` - Per-user settings (alert preferences, theme, districts)
3. `favorite_locations` - User-saved monitoring locations
4. `water_level_history` - Time-series data for river station readings

**Type Safety:**
- Drizzle-Zod integration for automatic schema-to-Zod conversion
- Shared types exported for both client and server use
- Insert schemas derived from table definitions

### Data Models

**Weather & Forecast:**
- Current weather data (temperature, humidity, precipitation, wind, cloud cover, pressure)
- Multi-mode forecasts (current, 24h, 48h, 72h, 5-day)
- Weather layers for different visualization types (rainfall, wind, temperature, humidity, clouds, pressure)

**River Monitoring:**
- Station metadata (ID, name, location coordinates, river, district)
- Real-time water level with status classification
- Trend indicators (rising/falling/stable)

**Flood Risk:**
- Geographic zones with risk level classification (low/medium/high/critical)
- District-level granularity
- Coordinate-based boundaries for map rendering

**Alerts & News:**
- Hazard alerts with severity levels (advisory/watch/warning/emergency)
- Categorized news items (weather/flood/disaster/general)
- Timestamp-based sorting for recent updates

### Static Asset Serving

**Production:**
- Express serves pre-built static files from `dist/public`
- Fallback to `index.html` for client-side routing support
- Single-page application architecture

**Development:**
- Vite dev server integrated as Express middleware
- Hot module replacement (HMR) over custom path
- Template reloading on every request for development speed

## External Dependencies

### Third-Party APIs

**Open-Meteo Weather API:**
- Provides current weather and forecast data for Sri Lanka
- Free tier API with no authentication required
- 10-minute cache to reduce API calls and improve performance
- Endpoint: `api.open-meteo.com/v1/forecast`

### Database Services

**PostgreSQL:**
- Primary relational database for persistent storage
- Connection via `DATABASE_URL` environment variable
- Session storage using `connect-pg-simple` adapter
- Drizzle ORM manages schema migrations in `./migrations` directory

### UI Component Libraries

**Radix UI:**
- Comprehensive set of unstyled, accessible component primitives
- Used for: dialogs, dropdowns, tooltips, accordions, tabs, popovers, selects, and more
- Provides ARIA-compliant accessibility out of the box

**Leaflet:**
- Open-source JavaScript library for interactive maps
- Tile layer from OpenStreetMap or similar providers
- Custom marker icons and circle overlays for flood visualization

### Utility Libraries

**Form Handling:**
- React Hook Form for form state management
- Zod resolver integration for validation
- Minimal re-renders with controlled inputs

**Date Handling:**
- date-fns for timestamp formatting and relative time display
- Used for "X minutes ago" style timestamps in alerts and news

**Styling:**
- clsx and tailwind-merge (via `cn` utility) for conditional className composition
- Autoprefixer for CSS vendor prefixing
- PostCSS for CSS processing pipeline

### Development Tools

**Replit Plugins:**
- `@replit/vite-plugin-runtime-error-modal` - Runtime error overlay
- `@replit/vite-plugin-cartographer` - Code navigation (dev only)
- `@replit/vite-plugin-dev-banner` - Development environment indicator (dev only)

**Build Tools:**
- TypeScript compiler for type checking (`tsc --noEmit`)
- ESBuild for fast server bundling
- Vite for optimized client bundling with code splitting