# Design Guidelines: Sri Lanka Flood Monitoring Dashboard

## Design Approach

**Hybrid System**: Drawing from Windy.app's weather visualization excellence combined with Material Design's data-heavy component patterns. This is a utility-first dashboard prioritizing information clarity, real-time data visibility, and emergency response efficiency.

**Key Principle**: Information immediacy over visual flourish. Users need critical flood and weather data instantly accessible.

---

## Layout Architecture

**Dashboard-First Layout** (No Hero Section):
- Full-height map view occupies 60-70% of viewport on desktop
- Persistent control panels overlay or dock to map edges
- Sidebar/drawer for detailed data, alerts, and news (toggleable on mobile)
- No traditional page sections - everything is dashboard components

**Spacing System**: 
Tailwind units: 1, 2, 4, 6, 8 for compact data density
- Controls/buttons: p-2, p-4
- Panel spacing: p-6, gap-4
- Section margins: my-4, my-6

---

## Typography

**Font Families**:
- Primary: Inter (clean, readable for data)
- Monospace: JetBrains Mono (for numerical values, coordinates)

**Type Scale**:
- Map labels: text-xs, text-sm (uppercase for categories)
- Data values: text-lg, text-xl, font-semibold
- Panel headers: text-base, font-medium
- Alerts: text-sm, font-bold
- News headlines: text-base

---

## Component Library

### 1. Interactive Map Canvas
- Full-screen base layer with Leaflet
- Semi-transparent overlay panels (backdrop-blur-sm)
- Weather layer toggle buttons (floating, top-right)
- Zoom controls (bottom-right)
- Location search bar (top-left, compact)

### 2. Control Panels
**Weather Layer Selector** (Floating panel, top-right):
- Icon + label grid: Rainfall, Wind, Temperature, Humidity, Clouds, Pressure
- Active state: border accent, slightly elevated
- Size: Compact 40x40px buttons in 2x3 grid

**Forecast Mode Switcher** (Horizontal tabs below map):
- Current | +24h | +48h | +72h | +5 days
- Slider indicator for timeline selection
- Real-time update indicator (pulsing dot)

**Risk Level Legend** (Bottom-left overlay):
- Low/Medium/High color scale
- Compact, collapsible
- Semi-transparent background

### 3. Data Sidebar (Right drawer, 320px wide)
**River Water Levels Section**:
- List of monitoring stations
- Current level + trend indicator (↑↓)
- Historical mini-chart (sparkline)
- Status badges: Normal/Warning/Critical

**Alerts Panel**:
- Chronological list, newest first
- Severity icons (⚠ ⚡ 🌊)
- Timestamp + location
- Expandable details

**News Feed**:
- Card layout with image thumbnails
- Headline + date
- Link to full article
- "Report Emergency" CTA button (prominent, red accent)

### 4. Mobile Navigation
- Bottom sheet drawer for controls
- Swipe-up gesture for full data view
- Hamburger menu for settings/layers
- Sticky emergency report button

---

## Map Visualization Patterns

**Weather Overlays**:
- Animated layers (wind particles, rain intensity gradients)
- Semi-transparent (opacity: 0.6-0.8)
- Smooth transitions between layers (300ms)

**Markers & Zones**:
- River stations: Custom pin icons with level indicators
- Flood zones: Polygon fills with gradient opacity
- Hazard alerts: Pulsing markers for active warnings

---

## Interaction States

**Buttons/Controls**:
- Default: Subtle border, slight shadow
- Hover: Lift (shadow-md)
- Active layer: Solid background, no hover state change
- Disabled: Reduced opacity (0.5)

**Map Interactions**:
- Click marker: Popup with detailed data
- Hover zone: Highlight boundary + tooltip
- Pan/zoom: Smooth momentum scrolling

---

## Data Visualization

**Numerical Display**:
- Large values with unit labels (e.g., "24.5 m" for water level)
- Trend arrows (↗ ↑ → ↘ ↓)
- Percentage change indicators
- Color-coded thresholds (green/yellow/red)

**Charts** (Where applicable):
- Line graphs for forecast trends
- Bar charts for rainfall accumulation
- Radial gauges for wind direction

---

## Accessibility

- WCAG AA contrast ratios for all text on map overlays
- Keyboard navigation for all controls
- Screen reader labels for map markers
- Alternative text-based view option

---

## Performance Considerations

- Lazy load news/data sections
- Debounced map rendering
- Cached weather layer tiles
- Progressive data loading (load visible viewport first)

---

## Images

**Map Base Tiles**: OpenStreetMap or Mapbox satellite imagery
**Weather Icons**: Use Heroicons or Weather Icons library via CDN
**News Thumbnails**: Fetched from news API sources
**Emergency Button Icon**: Warning/alert icon from icon library

No large hero images - the interactive map IS the visual centerpiece.

---

This dashboard prioritizes functional clarity, real-time responsiveness, and emergency-critical information delivery over decorative design elements.