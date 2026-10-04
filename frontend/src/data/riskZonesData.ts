export interface RiskZone {
  id: string;
  name: string;
  location: string;
  region: string;
  riskLevel: "Low" | "Moderate" | "High" | "Severe";
  thunderstormProb: number; // e.g. 78 (%)
  lightningProb: number; // e.g. 64 (%)
  expectedArrivalMin: number; // e.g. 24 (minutes)
  stormDirection: string; // e.g. "Northeast"
  center: [number, number]; // [lat, lon]
  polygon: [number, number][]; // coordinates for geographic boundary
  primaryThreats: string[];
}

export const AI_RISK_ZONES: RiskZone[] = [
  {
    id: "RZ-EAST-01",
    name: "Bengal-Odisha Convective Basin",
    location: "Kolkata, Howrah, Midnapore & Coastal Odisha",
    region: "East India",
    riskLevel: "Severe",
    thunderstormProb: 88,
    lightningProb: 82,
    expectedArrivalMin: 18,
    stormDirection: "East-Northeast (65°)",
    center: [22.4, 87.5],
    polygon: [
      [23.8, 85.5],
      [24.0, 88.8],
      [22.8, 89.2],
      [21.2, 88.2],
      [20.0, 86.4],
      [20.8, 84.8],
      [22.5, 84.5],
    ],
    primaryThreats: ["Severe Lightning (>40 fl/min)", "Squall Wind Gusts 70 km/h", "Localized Hail"],
  },
  {
    id: "RZ-GANGA-02",
    name: "Gangetic Plain & South Bihar Basin",
    location: "Patna, Gaya, Bhagalpur & Chota Nagpur",
    region: "East / Central India",
    riskLevel: "High",
    thunderstormProb: 78,
    lightningProb: 68,
    expectedArrivalMin: 28,
    stormDirection: "East-Southeast (110°)",
    center: [25.4, 85.2],
    polygon: [
      [26.5, 83.2],
      [26.8, 87.2],
      [25.0, 87.5],
      [23.8, 85.8],
      [24.2, 83.0],
    ],
    primaryThreats: ["Frequent Cloud-to-Ground Lightning", "Moderate Hail Risk", "Heavy Rain Squall"],
  },
  {
    id: "RZ-WEST-03",
    name: "Gujarat Saurashtra & Ahmedabad Corridor",
    location: "Ahmedabad, Gandhinagar & North Gujarat",
    region: "West India",
    riskLevel: "High",
    thunderstormProb: 78,
    lightningProb: 64,
    expectedArrivalMin: 24,
    stormDirection: "Northeast (45°)",
    center: [23.0, 72.6],
    polygon: [
      [24.2, 71.0],
      [24.5, 73.5],
      [22.8, 73.8],
      [21.5, 72.2],
      [21.8, 70.2],
      [23.2, 70.0],
    ],
    primaryThreats: ["Intense Lightning Activity", "Dust Storm / Squalls 55 km/h", "Flash Downpours"],
  },
  {
    id: "RZ-CENTRAL-04",
    name: "Central Vidarbha & Chhattisgarh Arc",
    location: "Nagpur, Raipur, Durg & Central Vidarbha",
    region: "Central India",
    riskLevel: "Moderate",
    thunderstormProb: 58,
    lightningProb: 46,
    expectedArrivalMin: 45,
    stormDirection: "East (90°)",
    center: [21.2, 80.5],
    polygon: [
      [22.5, 78.5],
      [23.0, 82.5],
      [20.5, 83.0],
      [19.5, 80.2],
      [20.2, 78.0],
    ],
    primaryThreats: ["Moderate Lightning Risk", "Gusty Winds 40-50 km/h", "Light to Moderate Showers"],
  },
  {
    id: "RZ-NE-05",
    name: "Brahmaputra Valley & Meghalaya Plateau",
    location: "Guwahati, Shillong, Cherrapunji & Lower Assam",
    region: "North-East India",
    riskLevel: "Moderate",
    thunderstormProb: 65,
    lightningProb: 52,
    expectedArrivalMin: 35,
    stormDirection: "East-Northeast (70°)",
    center: [26.0, 92.0],
    polygon: [
      [25.0, 90.0],
      [26.8, 91.2],
      [27.4, 94.2],
      [25.8, 93.6],
      [24.8, 91.2],
    ],
    primaryThreats: ["Orographic Thunderstorms", "Elevated Lightning Frequency", "Intense Rainfall"],
  },
  {
    id: "RZ-SOUTH-06",
    name: "Malabar Coastal Belt & Western Ghats",
    location: "Kochi, Kozhikode & Kerala Foothills",
    region: "South India",
    riskLevel: "Low",
    thunderstormProb: 32,
    lightningProb: 20,
    expectedArrivalMin: 80,
    stormDirection: "Stationary / Slow East",
    center: [10.5, 76.5],
    polygon: [
      [12.5, 75.0],
      [12.8, 76.8],
      [9.2, 77.2],
      [8.4, 76.8],
      [9.8, 75.8],
    ],
    primaryThreats: ["Isolated Convective Showers", "Occasional Lightning", "Maritime Gusts"],
  },
];

export interface AtmosphericParam {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  trend: "rising" | "falling" | "steady";
  trendText: string;
  status: "normal" | "elevated" | "severe";
  description: string;
  percent: number; // for visual meter (0-100)
}

export const CURRENT_ATMOSPHERIC_CONDITIONS: AtmosphericParam[] = [
  {
    id: "temp",
    name: "Temperature",
    value: "32.6",
    unit: "°C",
    trend: "rising",
    trendText: "+0.8°C / hr",
    status: "elevated",
    description: "Strong surface solar insolation generating thermal buoyancy",
    percent: 72,
  },
  {
    id: "humidity",
    name: "Relative Humidity",
    value: "79",
    unit: "%",
    trend: "rising",
    trendText: "+4% / hr",
    status: "severe",
    description: "High moisture convergence feeding low-level inflow",
    percent: 79,
  },
  {
    id: "wind_speed",
    name: "Surface Wind Speed",
    value: "42",
    unit: "km/h",
    trend: "rising",
    trendText: "Gusts to 58 km/h",
    status: "severe",
    description: "Strong gust front propagating ahead of convective line",
    percent: 68,
  },
  {
    id: "wind_dir",
    name: "Wind Direction",
    value: "245° (WSW)",
    unit: "deg",
    trend: "steady",
    trendText: "West-Southwesterly",
    status: "normal",
    description: "Moist maritime southwesterly maritime inflow from Bay of Bengal",
    percent: 65,
  },
  {
    id: "cape",
    name: "Convective Instability (CAPE)",
    value: "2,240",
    unit: "J/kg",
    trend: "rising",
    trendText: "Extremely Unstable",
    status: "severe",
    description: "High energy availability for explosive convective updraft growth",
    percent: 86,
  },
  {
    id: "wind_shear",
    name: "Deep Layer Wind Shear (0–6 km)",
    value: "19.5",
    unit: "m/s",
    trend: "rising",
    trendText: "Strong (>15 m/s)",
    status: "severe",
    description: "Organizes storms into multicell clusters and squall lines",
    percent: 78,
  },
  {
    id: "pressure",
    name: "Atmospheric Pressure (MSL)",
    value: "1003.8",
    unit: "hPa",
    trend: "falling",
    trendText: "-2.6 hPa / 3hr",
    status: "elevated",
    description: "Marked barometric drop signaling approaching mesoscale low",
    percent: 34,
  },
  {
    id: "cloud_top_temp",
    name: "Cloud-top Temperature (INSAT-3D)",
    value: "-64.5",
    unit: "°C",
    trend: "falling",
    trendText: "Deepening Overcast",
    status: "severe",
    description: "Overshooting tops penetrating the tropical tropopause (~14 km)",
    percent: 92,
  },
  {
    id: "lightning_rate",
    name: "Lightning Flash Density",
    value: "38",
    unit: "flashes/min",
    trend: "rising",
    trendText: "High Flash Rate",
    status: "severe",
    description: "Intense graupel-ice charge separation in updraft core",
    percent: 82,
  },
];

export interface DataSourceItem {
  id: string;
  name: string;
  status: "Online" | "Live" | "Receiving" | "Synchronized";
  statusColor: string;
  lastUpdated: string;
  coverage: string;
  dataType: string;
  sourceAuthority: string;
  isDemo: boolean;
}

export const OBSERVATION_DATA_SOURCES: DataSourceItem[] = [
  {
    id: "radar",
    name: "Weather Radar Network (DWR)",
    status: "Online",
    statusColor: "#16A34A",
    lastUpdated: "3 mins ago (10m cycle)",
    coverage: "17 Operational Radars (S, C, X-Band)",
    dataType: "Reflectivity (dBZ) & Storm Movement Vectors",
    sourceAuthority: "IMD Doppler Weather Radar Network",
    isDemo: false,
  },
  {
    id: "satellite",
    name: "Geostationary Satellite",
    status: "Live",
    statusColor: "#0284C7",
    lastUpdated: "8 mins ago (15m cycle)",
    coverage: "INSAT-3D / 3DR Pan-India & Ocean Basins",
    dataType: "Cloud Development & TIR-1 Brightness Temp",
    sourceAuthority: "ISRO / MOSDAC Meteorological Satellite Feed",
    isDemo: false,
  },
  {
    id: "lightning",
    name: "Ground Lightning Sensor Network",
    status: "Receiving",
    statusColor: "#EA580C",
    lastUpdated: "Real-time (<15s latency)",
    coverage: "IITM National Ground Sensor Detection Grid",
    dataType: "Lightning Activity (Cloud-to-Ground & Intra-Cloud)",
    sourceAuthority: "IITM Lightning Detection Network (Damini)",
    isDemo: false,
  },
  {
    id: "surface_stations",
    name: "Surface Weather Stations (AWS)",
    status: "Online",
    statusColor: "#16A34A",
    lastUpdated: "4 mins ago",
    coverage: "32 Synoptic & Automated Weather Stations",
    dataType: "Temperature, Dew Point, Pressure & Surface Winds",
    sourceAuthority: "IMD Surface Synoptic & AWS Observation Network",
    isDemo: false,
  },
  {
    id: "weather_model",
    name: "NWP / Weather Model (WRF / NCUM)",
    status: "Synchronized",
    statusColor: "#6366F1",
    lastUpdated: "00Z / 12Z Run (Refreshed 24m ago)",
    coverage: "High-Resolution 3km Indian Domain",
    dataType: "Atmospheric Instability (CAPE, CIN) & Vertical Wind Shear",
    sourceAuthority: "NCMRWF / IMD NWP Assimilation Model",
    isDemo: true, // Clearly labeled as Demo Data as requested
  },
];
