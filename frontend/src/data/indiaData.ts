export interface IndiaStation {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  region: "North" | "South" | "East" | "West" | "Central" | "North-East";
  isDWR: boolean; // Has Doppler Weather Radar
}

export const INDIA_STATIONS: IndiaStation[] = [
  // North India
  { id: "DEL", name: "New Delhi (Mausam Bhawan)", state: "Delhi", lat: 28.5892, lon: 77.2209, region: "North", isDWR: true },
  { id: "SXR", name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lon: 74.7973, region: "North", isDWR: true },
  { id: "IXC", name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lon: 76.7794, region: "North", isDWR: false },
  { id: "JAI", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, region: "North", isDWR: true },
  { id: "LKO", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, region: "North", isDWR: true },
  { id: "DED", name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lon: 78.0322, region: "North", isDWR: false },
  { id: "SLV", name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, region: "North", isDWR: false },

  // East India
  { id: "CCU", name: "Kolkata (Alipore)", state: "West Bengal", lat: 22.5284, lon: 88.3294, region: "East", isDWR: true },
  { id: "PAT", name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376, region: "East", isDWR: true },
  { id: "BBI", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lon: 85.8245, region: "East", isDWR: true },
  { id: "PRD", name: "Paradip", state: "Odisha", lat: 20.3165, lon: 86.6114, region: "East", isDWR: true },
  { id: "IXR", name: "Ranchi", state: "Jharkhand", lat: 23.3441, lon: 85.3096, region: "East", isDWR: false },

  // West India
  { id: "BOM", name: "Mumbai (Colaba)", state: "Maharashtra", lat: 18.8997, lon: 72.8153, region: "West", isDWR: true },
  { id: "PNQ", name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, region: "West", isDWR: false },
  { id: "NAG", name: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, region: "West", isDWR: true },
  { id: "AMD", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714, region: "West", isDWR: false },
  { id: "BHU", name: "Bhuj", state: "Gujarat", lat: 23.2420, lon: 69.6669, region: "West", isDWR: true },
  { id: "GOI", name: "Goa (Panaji)", state: "Goa", lat: 15.4909, lon: 73.8278, region: "West", isDWR: true },

  // Central India
  { id: "BHO", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, region: "Central", isDWR: true },
  { id: "RPR", name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lon: 81.6296, region: "Central", isDWR: false },
  { id: "GWL", name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lon: 78.1828, region: "Central", isDWR: false },

  // South India
  { id: "BLR", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946, region: "South", isDWR: true },
  { id: "MAA", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, region: "South", isDWR: true },
  { id: "HYD", name: "Hyderabad", state: "Telangana", lat: 17.3850, lon: 78.4867, region: "South", isDWR: true },
  { id: "VTZ", name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, region: "South", isDWR: true },
  { id: "COK", name: "Kochi", state: "Kerala", lat: 9.9312, lon: 76.2673, region: "South", isDWR: true },
  { id: "TRV", name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lon: 76.9366, region: "South", isDWR: true },
  { id: "MCB", name: "Machilipatnam", state: "Andhra Pradesh", lat: 16.1875, lon: 81.1389, region: "South", isDWR: true },

  // North-East India
  { id: "GAU", name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362, region: "North-East", isDWR: false },
  { id: "MHB", name: "Mohanbari (Dibrugarh)", state: "Assam", lat: 27.4839, lon: 95.0185, region: "North-East", isDWR: true },
  { id: "SHL", name: "Shillong / Cherrapunji", state: "Meghalaya", lat: 25.2986, lon: 91.7317, region: "North-East", isDWR: true },
  { id: "IXA", name: "Agartala", state: "Tripura", lat: 23.8315, lon: 91.2868, region: "North-East", isDWR: true },
  { id: "IMF", name: "Imphal", state: "Manipur", lat: 24.8170, lon: 93.9368, region: "North-East", isDWR: false },
];

export interface DWRStation {
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  band: "S-Band" | "C-Band" | "X-Band";
  rangeKm: number;
  status: "Operational" | "Maintenance";
}

export const IMD_DWR_NETWORK: DWRStation[] = [
  { name: "DWR New Delhi", city: "New Delhi", state: "Delhi", lat: 28.5892, lon: 77.2209, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Mumbai (Veravali)", city: "Mumbai", state: "Maharashtra", lat: 19.1305, lon: 72.8687, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Kolkata", city: "Kolkata", state: "West Bengal", lat: 22.5284, lon: 88.3294, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Chennai", city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Nagpur", city: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Bhopal", city: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Patna", city: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Mohanbari", city: "Dibrugarh", state: "Assam", lat: 27.4839, lon: 95.0185, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Agartala", city: "Agartala", state: "Tripura", lat: 23.8315, lon: 91.2868, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Cherrapunji", city: "Sohra", state: "Meghalaya", lat: 25.2986, lon: 91.7317, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Kochi", city: "Kochi", state: "Kerala", lat: 9.9312, lon: 76.2673, band: "C-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Goa", city: "Panaji", state: "Goa", lat: 15.4909, lon: 73.8278, band: "C-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Jaipur", city: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Srinagar", city: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lon: 74.7973, band: "X-Band", rangeKm: 150, status: "Operational" },
  { name: "DWR Paradip", city: "Paradip", state: "Odisha", lat: 20.3165, lon: 86.6114, band: "S-Band", rangeKm: 250, status: "Operational" },
  { name: "DWR Machilipatnam", city: "Machilipatnam", state: "Andhra Pradesh", lat: 16.1875, lon: 81.1389, band: "S-Band", rangeKm: 250, status: "Operational" },
];

export interface LiveWeatherData {
  stationId: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  temp: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // deg
  precipitation: number; // mm/h
  cape: number; // J/kg
  liftedIndex: number;
  weatherCode: number;
  cloudCover: number;
  riskLevel: "GREEN" | "YELLOW" | "ORANGE" | "RED";
  riskLabel: string;
}

export function classifyIMDRisk(cape: number, code: number, wind: number, rain: number): {
  level: "GREEN" | "YELLOW" | "ORANGE" | "RED";
  label: string;
} {
  // Severe thunderstorm / Hail
  if (code >= 95 || cape >= 2500 || wind >= 65 || rain >= 35) {
    return { level: "RED", label: "Warning (Take Action)" };
  }
  // Thunderstorm with rain or high instability
  if (code >= 91 || cape >= 1400 || wind >= 45 || rain >= 15) {
    return { level: "ORANGE", label: "Alert (Be Prepared)" };
  }
  // Rain showers / Moderate instability
  if (code >= 80 || code >= 60 || cape >= 700 || wind >= 30) {
    return { level: "YELLOW", label: "Watch (Be Updated)" };
  }
  return { level: "GREEN", label: "Normal (No Warning)" };
}

export function getWeatherConditionName(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 91 && code <= 92) return "Thunderstorm with Rain";
  if (code >= 95) return "Severe Thunderstorm / Hail";
  return "Cloudy";
}
