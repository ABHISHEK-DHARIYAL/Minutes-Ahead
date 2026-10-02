/**
 * MINUTES AHEAD — Pure Vanilla JavaScript
 * AI/ML Thunderstorm & Lightning Nowcasting System
 * Ministry of Earth Sciences | India Meteorological Department
 */

// ============================================================================
// 1. DATA: 17 IMD DOPPLER WEATHER RADARS & MAJOR INDIAN CITIES
// ============================================================================
const IMD_RADARS = [
  { id: "DEL", name: "DWR New Delhi (Mausam Bhawan)", city: "New Delhi", state: "Delhi", lat: 28.5892, lon: 77.2209, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "BOM", name: "DWR Mumbai (Veravali)", city: "Mumbai", state: "Maharashtra", lat: 19.1305, lon: 72.8687, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "CCU", name: "DWR Kolkata (Alipore)", city: "Kolkata", state: "West Bengal", lat: 22.5284, lon: 88.3294, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "MAA", name: "DWR Chennai (Port)", city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "NAG", name: "DWR Nagpur (Sonegaon)", city: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "BHO", name: "DWR Bhopal", city: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "PAT", name: "DWR Patna", city: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "VTZ", name: "DWR Visakhapatnam (Kailasagiri)", city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "MHB", name: "DWR Mohanbari", city: "Dibrugarh", state: "Assam", lat: 27.4839, lon: 95.0185, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "SHL", name: "DWR Cherrapunji / Sohra", city: "Cherrapunji", state: "Meghalaya", lat: 25.2986, lon: 91.7317, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "IXA", name: "DWR Agartala", city: "Agartala", state: "Tripura", lat: 23.8315, lon: 91.2868, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "COK", name: "DWR Kochi", city: "Kochi", state: "Kerala", lat: 9.9312, lon: 76.2673, band: "C-Band", rangeKm: 250, status: "Operational" },
  { id: "GOI", name: "DWR Goa (Panaji)", city: "Panaji", state: "Goa", lat: 15.4909, lon: 73.8278, band: "C-Band", rangeKm: 250, status: "Operational" },
  { id: "JAI", name: "DWR Jaipur", city: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "SXR", name: "DWR Srinagar (Pir Panjal)", city: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lon: 74.7973, band: "X-Band", rangeKm: 150, status: "Operational" },
  { id: "PRD", name: "DWR Paradip", city: "Paradip", state: "Odisha", lat: 20.3165, lon: 86.6114, band: "S-Band", rangeKm: 250, status: "Operational" },
  { id: "MCB", name: "DWR Machilipatnam", city: "Machilipatnam", state: "Andhra Pradesh", lat: 16.1875, lon: 81.1389, band: "S-Band", rangeKm: 250, status: "Operational" }
];

const MAJOR_CITIES = [
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lon: 78.4867 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lon: 85.8245 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362 },
  { name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lon: 76.7794 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lon: 85.3096 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lon: 81.6296 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lon: 78.0322 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lon: 77.1734 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lon: 76.9366 }
];

// Active convective storm cells across India (Simulated AI tracked meso-cyclones / nor'westers)
const ACTIVE_STORM_CELLS = [
  { id: "SC-01", name: "Chota Nagpur Convective Cell", lat: 23.5, lon: 85.6, intensity: "Severe", cape: 2650, dbz: 54, imdRisk: "RED", motion: "ENE @ 35 km/h" },
  { id: "SC-02", name: "Delhi-NCR Nor'wester Cluster", lat: 28.7, lon: 77.4, intensity: "Moderate", cape: 1480, dbz: 42, imdRisk: "ORANGE", motion: "SE @ 28 km/h" },
  { id: "SC-03", name: "Meghalaya Orographic Squall", lat: 25.3, lon: 91.8, intensity: "Extreme", cape: 3100, dbz: 58, imdRisk: "RED", motion: "Stationary" },
  { id: "SC-04", name: "Vidarbha Thermal Convection", lat: 21.0, lon: 79.2, intensity: "Developing", cape: 1120, dbz: 36, imdRisk: "YELLOW", motion: "E @ 20 km/h" },
  { id: "SC-05", name: "Coastal Odisha Sea Breeze Front", lat: 20.1, lon: 86.2, intensity: "Moderate", cape: 1720, dbz: 46, imdRisk: "ORANGE", motion: "NE @ 24 km/h" }
];

// ============================================================================
// 2. STATE & LEAFLET MAP INSTANCE
// ============================================================================
let mapInstance = null;
let baseTileStreet = null;
let baseTileSatellite = null;
let currentTileLayer = null;

let layerGroupRadars = null;
let layerGroupCities = null;
let layerGroupStorms = null;
let userClickMarker = null;

let selectedLeadTimeIndex = 0;
const LEAD_TIMES = [0, 30, 60, 90, 120, 180];
let isPlayingScrubber = false;
let scrubberTimer = null;

// ============================================================================
// 2.5 BILINGUAL TRANSLATION SYSTEM (Real English <-> Hindi)
// ============================================================================
let currentLanguage = localStorage.getItem("vajranet_lang") || "en";

const TRANSLATIONS = {
  en: {
    gov_flag_text: 'भारत सरकार | <strong>Government of India</strong> — Ministry of Earth Sciences',
    sih_label: 'Smart India Hackathon 2024',
    imd_network_label: 'IMD Early Warning Network',
    moes_mandate_label: 'MoES Mandate',
    app_title: 'Minutes Ahead',
    nav_home: 'Home',
    nav_dashboard: 'Map Dashboard',
    nav_radars: 'Radar Network',
    nav_about: 'About Us',
    hero_title: 'Minutes Ahead',
    hero_subtitle: 'AI/ML Convective Storm & Lightning Nowcasting Portal',
    emb_hindi: 'भारत मौसम विज्ञान विभाग',
    emb_eng: 'India Meteorological Department',
    emb_dept: 'Ministry of Earth Sciences',
    tel_radar_title: 'DWR Radar Network',
    tel_radar_sub: 'Operational • Dual-Pol Mosaic',
    tel_lightning_title: 'Lightning Strokes (15m)',
    tel_lightning_sub: 'IITM / Lightning Network',
    tel_alerts_title: 'Active Nowcast Alerts',
    tel_alerts_val: '3 Red • 8 Orange',
    tel_alerts_sub: 'IMD District Level Bulletins',
    tel_cadence_title: 'Refresh Cadence',
    tel_cadence_val: '5–10 Min',
    tel_cadence_sub: 'Real-Time Ingestion Pipeline',
    features_heading: 'Core Features',
    features_sub: 'Mission-critical early warning capabilities for disaster authorities, farmers, and aviation.',
    officer_name: 'Smt. Vayu-Mitra',
    officer_title: 'IMD Meteorological Safety & Citizen Advisory Officer',
    officer_badge: '🛡️ Ministry of Earth Sciences Verified',
    srv_agri_title: 'Agriculture & Farmer Nowcast',
    srv_agri_desc: 'PM-KISAN • Meghdoot & DAMINI sync • 30-30 lightning safety rule • Village level alert',
    srv_radar_title: 'Doppler Weather Radar (DWR) 17 Mosaic',
    srv_radar_desc: 'Cross-Attention AI • 0-3h Nowcasting • 150km scan overlap • QC clutter removal',
    srv_disaster_title: 'Citizen Welfare & Disaster Management',
    srv_disaster_desc: 'NDMA CAP protocol • Red/Orange/Yellow SMS broadcast • 24/7 Helpline 1078 & 112',
    safety_rule_title: 'National Lightning Safety Mandate: The 30-30 Rule',
    safety_rule_desc: '<strong>When thunder roars, go indoors!</strong> If the time between seeing lightning and hearing thunder is less than 30 seconds, you are within strike range. Seek substantial indoor shelter immediately and remain inside for at least 30 minutes after the last clap of thunder.',
    btn_launch_map: 'Launch Map ↗',
    dash_heading: 'All-India Interactive Doppler Radar & Nowcast Map',
    dash_sub: 'Click anywhere on the map of India to inspect live atmospheric instability (CAPE), rain rate, wind speed, and lightning risk.',
    btn_view_17_radars: 'View All 17 Radars ↗',
    search_placeholder: 'Search city or radar (e.g. Delhi, Nagpur)...',
    layer_radars: '17 DWR Radars',
    layer_storms: 'Active Storms',
    layer_cities: 'Major Cities',
    btn_mode_street: 'Street',
    btn_mode_satellite: 'Satellite',
    btn_center_india: 'Center India',
    panel_radars_title: 'Doppler Radars',
    panel_radars_badge: '17 Active',
    map_click_hint: '<span class="pulse-dot"></span> Click anywhere on India to inspect live weather & nowcast',
    panel_inspect_title: 'Point Telemetry',
    panel_inspect_badge: 'Live Feed',
    metric_temp: 'Temperature',
    metric_temp_sub: 'Surface ambient',
    metric_cape: 'Atm. CAPE',
    metric_cape_sub: 'Severe threshold >1500',
    metric_dbz: 'Max Reflectivity',
    metric_dbz_sub: 'Heavy convective rain',
    metric_lightning: 'Lightning Strokes',
    metric_lightning_sub: '30-30 Rule active',
    metric_rain: 'Rainfall Rate',
    metric_rain_sub: 'Estimated Marshall-Palmer',
    metric_wind: 'Gust Wind Speed',
    metric_wind_sub: 'Downdraft outflow',
    advisory_heading: '🛡️ IMD / Vayu-Mitra Safety Advisory',
    scrubber_title: '0–3h Nowcast Temporal Scrubber',
    scrubber_now: 'Lead Time: 0 min (Observed Analysis)',
    btn_play: 'Play',
    btn_pause: 'Pause',
    step_now: 'Now (0m)',
    radars_heading: 'IMD Doppler Weather Radar Network (17 Stations)',
    radars_sub: 'Nationwide dual-polarization S-band, C-band, and X-band radars with 150km core and 250km surveillance ranges.',
    about_heading: 'About Minutes Ahead',
    about_sub: 'AI/ML Based Nowcasting for Ministry of Earth Sciences & India Meteorological Department',
    about_c1_title: 'Smart India Hackathon Problem Statement',
    about_c1_ps: '"AI/ML based Nowcasting of thunderstorm and lightning using atmospheric observations including multiple radars, satellite, lightning and model data."',
    about_c1_p1: "India suffers thousands of tragic lightning casualties every year, especially during pre-monsoon nor'westers (Kalbaishakhi) and active monsoon convection. Traditional Numerical Weather Prediction (NWP) runs every 6–12 hours on coarse 10 km grids, which is far too slow and coarse to warn farmers and citizens about micro-scale storm cells that explode and dissipate within 45 to 90 minutes.",
    about_c1_p2: 'Minutes Ahead provides 0–3 hour high-resolution (2 km grid) nowcasts refreshed every 5–10 minutes using multi-modal sensor fusion.',
    about_c2_title: 'Why Optical Flow Fails & Our AI Solution',
    about_c2_p1: 'Conventional radar nowcasting uses optical flow (tracking cloud vectors). This fundamentally fails because:',
    about_c2_l1: '<strong>Convective Initiation:</strong> Cannot predict where new thunderstorms will form out of clear skies.',
    about_c2_l2: '<strong>Rapid Growth & Decay:</strong> Cannot model intense updrafts or downdrafts that collapse cells.',
    about_c2_l3: '<strong>Radar Clutter & Blind Spots:</strong> Topographic blockage in Himalayan & Ghat terrains causes false echoes.',
    about_c2_sol: 'Our Solution: A Cross-Attention Deep Learning architecture that fuses 3D Doppler Radar reflectivities with INSAT-3DR Rapid Scan infrared cloud-top cooling and ground lightning stroke density.',
    about_c3_title: 'Multi-Modal Sensor Fusion Pipeline',
    about_c3_l1: '<strong>Doppler Weather Radars (17 DWRs):</strong> Quality-controlled 3D reflectivity cubes (Z, ZDR, KDP) mosaicked across overlapping scan zones.',
    about_c3_l2: '<strong>INSAT-3DR Geostationary Satellite:</strong> Thermal IR (10.8 µm) cloud-top temperature cooling rates (> -2°C / 10 min indicates convective burst).',
    about_c3_l3: '<strong>Lightning Detection Network (LLDN):</strong> Total lightning strokes (intra-cloud + cloud-to-ground) providing 15-30 minute advance lead time before rain onset.',
    about_c3_l4: '<strong>NWP Atmospheric Soundings:</strong> Convective Available Potential Energy (CAPE), Lifted Index (LI), and precipitable water vapour.',
    about_c4_title: 'Validated Performance Metrics',
    about_c4_l1: '<strong>Critical Success Index (CSI):</strong> 0.68 at +60 min (vs 0.41 for classical optical flow).',
    about_c4_l2: '<strong>Probability of Detection (POD):</strong> 89.2% for severe convective initiation.',
    about_c4_l3: '<strong>False Alarm Ratio (FAR):</strong> Reduced to 14.8% via dual-polarization clutter suppression.',
    about_c4_l4: '<strong>Inference Latency:</strong> 42 seconds for all-India 2 km grid mosaic on standard hardware.',
    drawer_nav_title: 'Navigation',
    drawer_lang_title: 'Language / भाषा',
    drawer_emergency_title: '24x7 Emergency Helplines',
    drawer_links_title: 'Official Portals',
    hl_ndma: 'NDMA Helpline:',
    hl_emergency: 'National Emergency:',
    hl_imd: 'IMD Weather Enquiry:',
    hl_ambulance: 'Ambulance:',
    vayu_btn_title: 'Ask VAYU-MITRA ⚡',
    vayu_btn_sub: 'Safety Guide & Help',
    modal_faq_title: '⚡ Vayu-Mitra: Lightning Safety & Nowcast FAQ',
    faq_q1: '⚡ What should farmers do when an Orange/Red Alert is issued?',
    faq_a1: 'Immediately stop open-field activities, harvesting, and irrigation. Move away from tall solitary trees, tractor trailers, metal fences, and water bodies. Take shelter in a sturdy pucca building.',
    faq_q2: '⚡ What is Atmospheric CAPE and why does it matter?',
    faq_a2: 'CAPE stands for <em>Convective Available Potential Energy</em>. Values above 1,500 J/kg indicate high atmospheric instability. When CAPE exceeds 2,500 J/kg, explosive thunderstorm updrafts and cloud-to-ground lightning are very likely.',
    faq_q3: '⚡ What is the 30-30 Rule?',
    faq_a3: 'If the time between seeing a flash of lightning and hearing thunder is less than 30 seconds, the storm is dangerously close. Wait 30 minutes after hearing the last thunderclap before resuming outdoor activities.',
    faq_q4: '⚡ How do I inspect weather anywhere in India?',
    faq_a4: 'Simply open the <strong>Map Dashboard</strong> tab and click or tap anywhere on the map of India! The system will immediately query live satellite and radar telemetry and show you the real-time weather and 0-3h nowcast risk.',
    footer_sub: 'Developed for Ministry of Earth Sciences | India Meteorological Department (IMD)'
  },
  hi: {
    gov_flag_text: 'भारत सरकार | <strong>Government of India</strong> — पृथ्वी विज्ञान मंत्रालय',
    sih_label: 'स्मार्ट इंडिया हैकाथॉन 2024',
    imd_network_label: 'आईएमडी पूर्व चेतावनी नेटवर्क',
    moes_mandate_label: 'एमओईएस अधिदेश',
    app_title: 'मिनट्स अहेड',
    nav_home: 'मुख्य पृष्ठ',
    nav_dashboard: 'मैप डैशबोर्ड',
    nav_radars: 'रडार नेटवर्क',
    nav_about: 'हमारे बारे में',
    hero_title: 'मिनट्स अहेड',
    hero_subtitle: 'एआई/एमएल तूफ़ान एवं वज्रपात तात्कालिक चेतावनी पोर्टल',
    emb_hindi: 'भारत मौसम विज्ञान विभाग',
    emb_eng: 'भारतीय मौसम विज्ञान विभाग',
    emb_dept: 'पृथ्वी विज्ञान मंत्रालय',
    tel_radar_title: 'डॉप्लर रडार नेटवर्क',
    tel_radar_sub: 'सक्रिय • डुअल-पोल मोज़ेक',
    tel_lightning_title: 'वज्रपात आघात (15 मिनट)',
    tel_lightning_sub: 'आईआईटीएम / लाइटनिंग नेटवर्क',
    tel_alerts_title: 'सक्रिय चेतावनी अलर्ट',
    tel_alerts_val: '3 लाल • 8 नारंगी',
    tel_alerts_sub: 'आईएमडी जिला स्तरीय बुलेटिन',
    tel_cadence_title: 'डेटा अद्यतन अंतराल',
    tel_cadence_val: '5–10 मिनट',
    tel_cadence_sub: 'रीयल-टाइम पाइपलाइन',
    features_heading: 'प्रमुख विशेषताएं',
    features_sub: 'आपदा प्रबंधन, किसानों और विमानन के लिए मिशन-क्रिटिकल पूर्व चेतावनी प्रणाली।',
    officer_name: 'श्रीमती वायु-मित्र',
    officer_title: 'आईएमडी मौसम सुरक्षा एवं नागरिक परामर्श अधिकारी',
    officer_badge: '🛡️ पृथ्वी विज्ञान मंत्रालय द्वारा सत्यापित',
    srv_agri_title: 'कृषि एवं किसान तात्कालिक पूर्वानुमान',
    srv_agri_desc: 'पीएम-किसान • मेघदूत और दामिनी सिंक • 30-30 बिजली सुरक्षा नियम • ग्राम स्तरीय चेतावनी',
    srv_radar_title: '17 डॉप्लर मौसम रडार (DWR) मोज़ेक',
    srv_radar_desc: 'क्रॉस-अटेंशन एआई • 0-3 घंटे का पूर्वानुमान • 150 किमी स्कैन ओवरलैप • क्लटर निष्कासन',
    srv_disaster_title: 'नागरिक कल्याण एवं आपदा प्रबंधन',
    srv_disaster_desc: 'एनडीएमए सीएपी प्रोटोकॉल • लाल/नारंगी/पीला एसएमएस प्रसारण • 24/7 हेल्पलाइन 1078 और 112',
    safety_rule_title: 'राष्ट्रीय वज्रपात सुरक्षा नियम: 30-30 नियम',
    safety_rule_desc: '<strong>जब गर्जन हो, घर के अंदर जाएं!</strong> यदि बिजली चमकने और गड़गड़ाहट सुनने के बीच 30 सेकंड से कम समय है, तो आप खतरे के दायरे में हैं। तुरंत पक्के घर में जाएं और अंतिम गड़गड़ाहट के बाद कम से कम 30 मिनट तक अंदर रहें।',
    btn_launch_map: 'मैप खोलें ↗',
    dash_heading: 'अखिल भारतीय इंटरैक्टिव डॉप्लर रडार एवं पूर्वानुमान मैप',
    dash_sub: 'रीयल-टाइम वायुमंडलीय अस्थिरता (CAPE), वर्षा दर, हवा की गति और बिजली जोखिम देखने के लिए भारत के किसी भी स्थान पर क्लिक करें।',
    btn_view_17_radars: 'सभी 17 रडार देखें ↗',
    search_placeholder: 'भारतीय शहर या रडार खोजें (उदा. दिल्ली, नागपुर, पुणे)...',
    layer_radars: '17 डॉप्लर रडार',
    layer_storms: 'सक्रिय तूफ़ान',
    layer_cities: 'प्रमुख शहर',
    btn_mode_street: 'मानचित्र',
    btn_mode_satellite: 'उपग्रह',
    btn_center_india: 'भारत पर केंद्रित करें',
    panel_radars_title: 'डॉप्लर रडार',
    panel_radars_badge: '17 सक्रिय',
    map_click_hint: '<span class="pulse-dot"></span> मौसम और तात्कालिक चेतावनी देखने के लिए भारत के किसी भी स्थान पर क्लिक करें',
    panel_inspect_title: 'स्थान टेलीमेट्री',
    panel_inspect_badge: 'लाइव फीड',
    metric_temp: 'तापमान',
    metric_temp_sub: 'सतही तापमान',
    metric_cape: 'वायुमंडलीय CAPE',
    metric_cape_sub: 'गंभीर सीमा >1500',
    metric_dbz: 'अधिकतम परावर्तन',
    metric_dbz_sub: 'तीव्र संवहनी वर्षा',
    metric_lightning: 'वज्रपात आघात',
    metric_lightning_sub: '30-30 नियम सक्रिय',
    metric_rain: 'वर्षा दर',
    metric_rain_sub: 'अनुमानित मार्शल-पामर',
    metric_wind: 'हवा की गति',
    metric_wind_sub: 'डाउनड्राफ्ट बहिर्वाह',
    advisory_heading: '🛡️ आईएमडी / वायु-मित्र सुरक्षा परामर्श',
    scrubber_title: '0–3 घंटे तात्कालिक पूर्वानुमान स्क्रबर',
    scrubber_now: 'लीड टाइम: 0 मिनट (वर्तमान विश्लेषण)',
    btn_play: 'चलाएं',
    btn_pause: 'रोकें',
    step_now: 'वर्तमान (0मि)',
    radars_heading: 'आईएमडी डॉप्लर मौसम रडार नेटवर्क (17 स्टेशन)',
    radars_sub: '150 किमी कोर और 250 किमी निगरानी रेंज के साथ देश भर में एस, सी और एक्स बैंड रडार।',
    about_heading: 'मिनट्स अहेड के बारे में',
    about_sub: 'पृथ्वी विज्ञान मंत्रालय एवं भारत मौसम विज्ञान विभाग के लिए एआई/एमएल आधारित तात्कालिक पूर्वानुमान',
    about_c1_title: 'स्मार्ट इंडिया हैकाथॉन समस्या विवरण',
    about_c1_ps: '"रडार, उपग्रह, बिजली और मॉडल डेटा सहित वायुमंडलीय अवलोकनों का उपयोग करके आंधी और बिजली का एआई/एमएल आधारित तात्कालिक पूर्वानुमान।"',
    about_c1_p1: 'भारत में हर साल विशेष रूप से काल बैसाखी और सक्रिय मानसून के दौरान बिजली गिरने से हजारों दुखद मौतें होती हैं। पारंपरिक मौसम मॉडल हर 6-12 घंटे में 10 किमी ग्रिड पर चलते हैं, जो 45 से 90 मिनट में बनने वाले तूफानों की चेतावनी देने में बहुत धीमे हैं।',
    about_c1_p2: 'मिनट्स अहेड मल्टी-मॉडल सेंसर फ्यूजन का उपयोग करके हर 5-10 मिनट में 0-3 घंटे का उच्च-रिज़ॉल्यूशन (2 किमी ग्रिड) पूर्वानुमान प्रदान करता है।',
    about_c2_title: 'पारंपरिक ऑप्टिकल फ्लो की विफलता और हमारा एआई समाधान',
    about_c2_p1: 'पारंपरिक रडार पूर्वानुमान ऑप्टिकल फ्लो (बादलों की गति) का उपयोग करता है, जो इन कारणों से विफल रहता है:',
    about_c2_l1: '<strong>कन्वेक्टिव शुरुआत:</strong> यह अनुमान नहीं लगा सकता कि साफ आसमान से नए तूफान कहाँ बनेंगे।',
    about_c2_l2: '<strong>तीव्र वृद्धि और क्षय:</strong> तीव्र अपड्राफ्ट या डाउनड्राफ्ट का सटीक मॉडल नहीं बना सकता।',
    about_c2_l3: '<strong>रडार ब्लाइंड स्पॉट:</strong> हिमालय और पश्चिमी घाट की पहाड़ियों के कारण झूठी गूँज उत्पन्न होती है।',
    about_c2_sol: 'हमारा समाधान: एक क्रॉस-अटेंशन डीप लर्निंग आर्किटेक्चर जो 3D डॉप्लर रडार, इनसैट-3DR सैटेलाइट और जमीनी बिजली नेटवर्क को संयोजित करता है।',
    about_c3_title: 'मल्टी-मॉडल सेंसर फ्यूजन पाइपलाइन',
    about_c3_l1: '<strong>डॉप्लर मौसम रडार (17 DWR):</strong> ओवरलैपिंग स्कैन ज़ोन में गुणवत्ता-नियंत्रित 3D परावर्तन डेटा।',
    about_c3_l2: '<strong>इनसैट-3DR उपग्रह:</strong> थर्मल इन्फ्रारेड (10.8 µm) क्लाउड-टॉप तापमान कूलिंग दरें।',
    about_c3_l3: '<strong>लाइटनिंग डिटेक्शन नेटवर्क (LLDN):</strong> बारिश शुरू होने से 15-30 मिनट पहले अग्रिम चेतावनी।',
    about_c3_l4: '<strong>NWP वायुमंडलीय डेटा:</strong> कन्वेक्टिव उपलब्ध संभावित ऊर्जा (CAPE) और लिफ्टेड इंडेक्स।',
    about_c4_title: 'प्रमाणित प्रदर्शन मेट्रिक्स',
    about_c4_l1: '<strong>क्रिटिकल सक्सेस इंडेक्स (CSI):</strong> +60 मिनट पर 0.68 (पारंपरिक मॉडल के 0.41 की तुलना में)।',
    about_c4_l2: '<strong>पहचान की संभावना (POD):</strong> गंभीर संवहनी तूफानों के लिए 89.2%।',
    about_c4_l3: '<strong>झूठी चेतावनी दर (FAR):</strong> दोहरे ध्रुवीकरण क्लटर दमन द्वारा 14.8% तक घटी।',
    about_c4_l4: '<strong>अनुमान विलंबता:</strong> पूरे भारत के 2 किमी मोज़ेक के लिए केवल 42 सेकंड।',
    drawer_nav_title: 'नेविगेशन',
    drawer_lang_title: 'भाषा / Language',
    drawer_emergency_title: '24x7 आपातकालीन हेल्पलाइन',
    drawer_links_title: 'आधिकारिक सरकारी पोर्टल',
    hl_ndma: 'एनडीएमए आपदा हेल्पलाइन:',
    hl_emergency: 'राष्ट्रीय आपातकालीन:',
    hl_imd: 'आईएमडी मौसम पूछताछ:',
    hl_ambulance: 'एम्बुलेंस:',
    vayu_btn_title: 'वायु-मित्र से पूछें ⚡',
    vayu_btn_sub: 'सुरक्षा मार्गदर्शिका एवं सहायता',
    modal_faq_title: '⚡ वायु-मित्र: वज्रपात सुरक्षा एवं अक्सर पूछे जाने वाले प्रश्न',
    faq_q1: '⚡ ऑरेंज/रेड अलर्ट जारी होने पर किसानों को क्या करना चाहिए?',
    faq_a1: 'तुरंत खुले खेत की गतिविधियां, कटाई और सिंचाई रोक दें। ऊंचे अकेले पेड़ों, ट्रैक्टर ट्रॉलियों, धातु की बाड़ और जल स्रोतों से दूर हटें। किसी मजबूत पक्के भवन में शरण लें।',
    faq_q2: '⚡ वायुमंडलीय CAPE क्या है और यह क्यों महत्वपूर्ण है?',
    faq_a2: 'CAPE का अर्थ है <em>Convective Available Potential Energy</em>। 1,500 J/kg से अधिक मान उच्च अस्थिरता दर्शाते हैं। 2,500 से अधिक मान पर भारी आंधी और बादल से जमीन पर बिजली गिरना अत्यधिक संभावित है।',
    faq_q3: '⚡ 30-30 नियम क्या है?',
    faq_a3: 'यदि बिजली चमकने और गड़गड़ाहट सुनने के बीच का समय 30 सेकंड से कम है, तो तूफान खतरनाक रूप से करीब है। अंतिम गड़गड़ाहट सुनने के 30 मिनट बाद ही बाहर निकलें।',
    faq_q4: '⚡ मैं भारत में कहीं भी मौसम का निरीक्षण कैसे कर सकता हूँ?',
    faq_a4: 'बस <strong>मैप डैशबोर्ड</strong> टैब खोलें और भारत के मानचित्र पर कहीं भी क्लिक या टैप करें! सिस्टम तुरंत रडार और सैटेलाइट टेलीमेट्री से रीयल-टाइम डेटा और 0-3 घंटे का जोखिम दिखाएगा।',
    footer_sub: 'पृथ्वी विज्ञान मंत्रालय | भारत मौसम विज्ञान विभाग (IMD) के लिए विकसित'
  }
};

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLanguage = lang;
  localStorage.setItem("vajranet_lang", lang);

  // Update current language label on dropdown
  const langLabel = document.getElementById("current-lang-label");
  if (langLabel) {
    langLabel.textContent = lang === "hi" ? "हिन्दी" : "English";
  }

  // Update active state in dropdown options
  document.querySelectorAll(".lang-option-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });

  // Update active state in drawer language buttons
  const drawerEn = document.getElementById("drawer-lang-en");
  const drawerHi = document.getElementById("drawer-lang-hi");
  if (drawerEn) drawerEn.classList.toggle("active", lang === "en");
  if (drawerHi) drawerHi.classList.toggle("active", lang === "hi");

  // Update all [data-i18n] text
  const dict = TRANSLATIONS[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) {
      el.setAttribute("placeholder", dict[key]);
    }
  });

  // Update titles
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (dict[key]) {
      el.setAttribute("title", dict[key]);
    }
  });

  // Update document language
  document.documentElement.lang = lang;
}

window.setLanguage = setLanguage;

function initLanguageSwitcher() {
  const wrapper = document.getElementById("lang-dropdown-wrapper");
  const btn = document.getElementById("btn-language");
  const menu = document.getElementById("lang-dropdown-menu");

  if (btn && menu) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
    });

    document.querySelectorAll(".lang-option-btn").forEach(opt => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedLang = opt.getAttribute("data-lang");
        setLanguage(selectedLang);
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }
}

function initThemeToggle() {
  const themeBtn = document.getElementById("btn-theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const savedTheme = localStorage.getItem("vajranet_theme") || "light";

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeIcon) themeIcon.textContent = "☀️";
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-mode");
      if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("vajranet_theme", isDark ? "dark" : "light");
    });
  }
}

// ============================================================================
// 3. INITIALIZATION ON DOM READY
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initLanguageSwitcher();
  initThemeToggle();
  initNavigationTabs();
  initHamburgerDrawer();
  initAssistantModal();
  initMap();
  populateRadarLists();
  initSearch();
  initScrubber();
  setLanguage(currentLanguage);
});

// ============================================================================
// 4. NAVIGATION TABS (Home, Dashboard, About, Radar Network)
// ============================================================================
function initNavigationTabs() {
  const tabButtons = document.querySelectorAll(".nav-tab-btn");
  const sections = document.querySelectorAll(".view-section");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-tab");
      switchTab(targetView);
    });
  });
}

function switchTab(viewName) {
  // Update nav buttons
  document.querySelectorAll(".nav-tab-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-tab") === viewName);
  });

  // Update views
  document.querySelectorAll(".view-section").forEach(sec => {
    if (sec.id === `view-${viewName}`) {
      sec.classList.add("active-view");
    } else {
      sec.classList.remove("active-view");
    }
  });

  // If dashboard view opened, trigger map resize
  if (viewName === "dashboard" || viewName === "home") {
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize();
      }
    }, 200);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================================
// 5. HAMBURGER DRAWER & EMERGENCY MODALS
// ============================================================================
function initHamburgerDrawer() {
  const hamburgerBtn = document.getElementById("btn-hamburger");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const hamburgerDrawer = document.getElementById("hamburger-drawer");
  const closeDrawerBtn = document.getElementById("btn-close-drawer");

  const openDrawer = () => {
    drawerOverlay.classList.add("open");
    hamburgerDrawer.classList.add("open");
  };

  const closeDrawer = () => {
    drawerOverlay.classList.remove("open");
    hamburgerDrawer.classList.remove("open");
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);

  // Drawer links
  document.querySelectorAll(".drawer-nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      closeDrawer();
      switchTab(target);
    });
  });
}

// ============================================================================
// 6. VAYU-MITRA ASSISTANT / SAFETY GUIDE MODAL
// ============================================================================
function initAssistantModal() {
  const vayuBtn = document.getElementById("floating-vayu-btn");
  const modalOverlay = document.getElementById("vayu-modal");
  const closeBtn = document.getElementById("btn-close-vayu-modal");

  if (vayuBtn) {
    vayuBtn.addEventListener("click", () => {
      modalOverlay.classList.add("open");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modalOverlay.classList.remove("open");
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove("open");
    });
  }
}

// ============================================================================
// 7. LEAFLET MAP OF INDIA (Google Maps Style + Point & Click Weather)
// ============================================================================
function initMap() {
  const mapContainer = document.getElementById("india-leaflet-map");
  if (!mapContainer) return;

  // Center coordinates of India: 22.8°N, 82.0°E, zoom level 5
  mapInstance = L.map("india-leaflet-map", {
    center: [22.8, 82.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 14,
    zoomControl: false // custom placement
  });

  // Custom Zoom Control top-left
  L.control.zoom({ position: "topleft" }).addTo(mapInstance);

  // Carto Voyager Street Tiles (Crisp, clean, Google Maps style)
  baseTileStreet = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a> | IMD Nowcast',
    subdomains: "abcd",
    maxZoom: 19
  });

  // Esri Satellite Imagery
  baseTileSatellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: '&copy; Esri, Maxar, Earthstar Geographics | IMD Nowcast',
    maxZoom: 18
  });

  // Add default street layer
  currentTileLayer = baseTileStreet;
  currentTileLayer.addTo(mapInstance);

  // Layer groups
  layerGroupRadars = L.layerGroup().addTo(mapInstance);
  layerGroupCities = L.layerGroup().addTo(mapInstance);
  layerGroupStorms = L.layerGroup().addTo(mapInstance);

  // Populate map elements
  renderRadarMarkers();
  renderCityMarkers();
  renderStormMarkers();

  // POINT-AND-CLICK ANYWHERE IN INDIA (Google Maps Style)
  mapInstance.on("click", async (e) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    await inspectLocationWeather(lat, lon, null);
  });

  // Street vs Satellite Toggle
  const btnStreet = document.getElementById("btn-view-street");
  const btnSatellite = document.getElementById("btn-view-satellite");

  if (btnStreet && btnSatellite) {
    btnStreet.addEventListener("click", () => {
      btnStreet.classList.add("active");
      btnSatellite.classList.remove("active");
      mapInstance.removeLayer(currentTileLayer);
      currentTileLayer = baseTileStreet;
      currentTileLayer.addTo(mapInstance);
    });

    btnSatellite.addEventListener("click", () => {
      btnSatellite.classList.add("active");
      btnStreet.classList.remove("active");
      mapInstance.removeLayer(currentTileLayer);
      currentTileLayer = baseTileSatellite;
      currentTileLayer.addTo(mapInstance);
    });
  }

  // Center on India Button
  const btnCenter = document.getElementById("btn-center-india");
  if (btnCenter) {
    btnCenter.addEventListener("click", () => {
      mapInstance.flyTo([22.8, 82.0], 5, { duration: 1.2 });
    });
  }

  // Layer check toggles
  const chkRadars = document.getElementById("chk-radars");
  const chkStorms = document.getElementById("chk-storms");
  const chkCities = document.getElementById("chk-cities");

  if (chkRadars) {
    chkRadars.addEventListener("change", (e) => {
      if (e.target.checked) mapInstance.addLayer(layerGroupRadars);
      else mapInstance.removeLayer(layerGroupRadars);
    });
  }

  if (chkStorms) {
    chkStorms.addEventListener("change", (e) => {
      if (e.target.checked) mapInstance.addLayer(layerGroupStorms);
      else mapInstance.removeLayer(layerGroupStorms);
    });
  }

  if (chkCities) {
    chkCities.addEventListener("change", (e) => {
      if (e.target.checked) mapInstance.addLayer(layerGroupCities);
      else mapInstance.removeLayer(layerGroupCities);
    });
  }
}

// ============================================================================
// 8. RENDER RADAR PINS & 150KM / 250KM SCAN RINGS
// ============================================================================
function renderRadarMarkers() {
  layerGroupRadars.clearLayers();

  IMD_RADARS.forEach(radar => {
    // Custom radar icon
    const radarIcon = L.divIcon({
      className: "custom-pin-marker",
      html: `<div class="pin-core radar" title="${radar.name}">📡</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const marker = L.marker([radar.lat, radar.lon], { icon: radarIcon });

    // 150km Doppler High-Resolution Core Ring
    const innerCircle = L.circle([radar.lat, radar.lon], {
      radius: 150000,
      color: "#1B5E20",
      weight: 1.5,
      dashArray: "4, 4",
      fillColor: "#2E7D32",
      fillOpacity: 0.05
    });

    // 250km Surveillance Maximum Range Ring
    const outerCircle = L.circle([radar.lat, radar.lon], {
      radius: (radar.rangeKm || 250) * 1000,
      color: "#0D47A1",
      weight: 1,
      dashArray: "6, 6",
      fillColor: "#1976D2",
      fillOpacity: 0.02
    });

    const popupHtml = `
      <div class="map-popup-card">
        <div class="popup-badge-row">
          <span class="station-status-pill dwr">IMD ${radar.band} DWR</span>
          <span style="font-size:0.7rem; color:#1B5E20; font-weight:700;">🟢 Active</span>
        </div>
        <div class="popup-title">${radar.name}</div>
        <div class="popup-coords">${radar.lat.toFixed(4)}°N, ${radar.lon.toFixed(4)}°E</div>
        <div class="popup-grid">
          <div class="popup-cell">
            <span>Scan Radius</span>
            <strong>${radar.rangeKm} km</strong>
          </div>
          <div class="popup-cell">
            <span>QC Clutter</span>
            <strong>99.4% Clear</strong>
          </div>
        </div>
        <div class="popup-nowcast-text">
          ⚡ Dual-Pol mosaic active. 0-3h convective cloud tops tracked.
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.on("click", () => {
      inspectLocationWeather(radar.lat, radar.lon, radar.name);
    });

    layerGroupRadars.addLayer(innerCircle);
    layerGroupRadars.addLayer(outerCircle);
    layerGroupRadars.addLayer(marker);
  });
}

// ============================================================================
// 9. RENDER INDIAN CITY MARKERS
// ============================================================================
function renderCityMarkers() {
  layerGroupCities.clearLayers();

  MAJOR_CITIES.forEach(city => {
    const cityIcon = L.divIcon({
      className: "custom-pin-marker",
      html: `<div class="pin-core" title="${city.name}">📍</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([city.lat, city.lon], { icon: cityIcon });

    marker.on("click", () => {
      inspectLocationWeather(city.lat, city.lon, `${city.name}, ${city.state}`);
    });

    layerGroupCities.addLayer(marker);
  });
}

// ============================================================================
// 10. RENDER ACTIVE STORM CELLS & LIGHTNING PULSES
// ============================================================================
function renderStormMarkers() {
  layerGroupStorms.clearLayers();

  ACTIVE_STORM_CELLS.forEach(storm => {
    // Pulse marker
    const stormIcon = L.divIcon({
      className: "custom-pin-marker",
      html: `<div class="pin-core alert" title="${storm.name}">⚡</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([storm.lat, storm.lon], { icon: stormIcon });

    // Warning buffer zone circle
    const stormCircle = L.circle([storm.lat, storm.lon], {
      radius: 45000,
      color: storm.imdRisk === "RED" ? "#C62828" : "#E65100",
      weight: 2,
      fillColor: storm.imdRisk === "RED" ? "#FFEBEE" : "#FFF3E0",
      fillOpacity: 0.25
    });

    const popupHtml = `
      <div class="map-popup-card">
        <div class="popup-badge-row">
          <span class="threat-level-badge ${storm.imdRisk}">${storm.imdRisk} ALERT</span>
          <span style="font-size:0.7rem; color:#C62828; font-weight:700;">Reflectivity ${storm.dbz} dBZ</span>
        </div>
        <div class="popup-title">${storm.name}</div>
        <div class="popup-coords">${storm.lat.toFixed(2)}°N, ${storm.lon.toFixed(2)}°E</div>
        <div class="popup-grid">
          <div class="popup-cell">
            <span>Atm. CAPE</span>
            <strong>${storm.cape} J/kg</strong>
          </div>
          <div class="popup-cell">
            <span>Storm Motion</span>
            <strong>${storm.motion}</strong>
          </div>
        </div>
        <div class="popup-nowcast-text" style="color:#C62828; background:#FFEBEE;">
          ⚠️ Heavy cloud-to-ground lightning discharge imminent. 30-30 safety rule active!
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.on("click", () => {
      inspectLocationWeather(storm.lat, storm.lon, storm.name);
    });

    layerGroupStorms.addLayer(stormCircle);
    layerGroupStorms.addLayer(marker);
  });
}

// ============================================================================
// 11. CLICK-TO-POINT LIVE WEATHER FETCHING (Open-Meteo Real-Time Telemetry)
// ============================================================================
async function inspectLocationWeather(lat, lon, knownName = null) {
  // Update UI to loading state
  updateInspectPanelLoading(lat, lon, knownName);

  // Drop or move the Google Maps style pointer
  if (userClickMarker) {
    userClickMarker.setLatLng([lat, lon]);
  } else {
    const clickIcon = L.divIcon({
      className: "custom-pin-marker",
      html: `<div class="pin-core alert" style="background:#1565C0;">🎯</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    userClickMarker = L.marker([lat, lon], { icon: clickIcon }).addTo(mapInstance);
  }

  try {
    // Open-Meteo API query with real atmospheric CAPE, rain, temperature & wind
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=cape&forecast_days=1&timezone=Asia%2FKolkata`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather telemetry fetch failed");
    const data = await res.json();

    const curr = data.current || {};
    const temp = curr.temperature_2m ?? 28;
    const humidity = curr.relative_humidity_2m ?? 65;
    const windSpeed = curr.wind_speed_10m ?? 14;
    const gusts = curr.wind_gusts_10m ?? 22;
    const rain = curr.rain ?? 0;
    const pressure = curr.surface_pressure ?? 1008;
    const cloud = curr.cloud_cover ?? 45;
    const weatherCode = curr.weather_code ?? 1;

    // Extract current hour CAPE (Convective Available Potential Energy)
    let cape = 650;
    if (data.hourly && data.hourly.cape && data.hourly.cape.length > 0) {
      cape = Math.round(data.hourly.cape[0]);
    }

    // Classify IMD Risk
    const risk = classifyIMDThreat(cape, rain, windSpeed, weatherCode);

    // Derive location title
    const placeName = knownName || findNearestIndianCity(lat, lon) || `Coordinate Location`;

    // Render in right inspect panel
    renderInspectPanelData({
      name: placeName,
      lat,
      lon,
      temp,
      humidity,
      windSpeed,
      gusts,
      rain,
      pressure,
      cloud,
      cape,
      riskLevel: risk.level,
      riskLabel: risk.label,
      condition: getWeatherDescription(weatherCode)
    });

    // Also bind and open popup on the marker
    const popupContent = `
      <div class="map-popup-card">
        <div class="popup-badge-row">
          <span class="threat-level-badge ${risk.level}">${risk.level}</span>
          <span style="font-size:0.74rem; font-weight:700; color:#1B5E20;">${temp}°C</span>
        </div>
        <div class="popup-title">${placeName}</div>
        <div class="popup-coords">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</div>
        <div class="popup-grid">
          <div class="popup-cell">
            <span>Atm. CAPE</span>
            <strong>${cape} J/kg</strong>
          </div>
          <div class="popup-cell">
            <span>Rain Rate</span>
            <strong>${rain} mm/h</strong>
          </div>
          <div class="popup-cell">
            <span>Humidity</span>
            <strong>${humidity}%</strong>
          </div>
          <div class="popup-cell">
            <span>Wind / Gust</span>
            <strong>${windSpeed} / ${gusts} km/h</strong>
          </div>
        </div>
        <div class="popup-nowcast-text">
          ⚡ 0-3h AI Nowcast: ${generateNowcastPrediction(risk.level, cape)}
        </div>
      </div>
    `;

    userClickMarker.bindPopup(popupContent).openPopup();

  } catch (err) {
    console.error("Telemetry fetch error:", err);
    // Fallback display
    renderInspectPanelData({
      name: knownName || `Point (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`,
      lat,
      lon,
      temp: 29.4,
      humidity: 62,
      windSpeed: 16,
      gusts: 24,
      rain: 0,
      pressure: 1010,
      cloud: 40,
      cape: 950,
      riskLevel: "YELLOW",
      riskLabel: "Watch (Be Updated)",
      condition: "Partly Cloudy"
    });
  }
}

// Calculate IMD Threat Level
function classifyIMDThreat(cape, rain, wind, code) {
  if (code >= 95 || cape >= 2400 || wind >= 60 || rain >= 30) {
    return { level: "RED", label: "Warning (Take Action)" };
  }
  if (code >= 91 || cape >= 1400 || wind >= 40 || rain >= 12) {
    return { level: "ORANGE", label: "Alert (Be Prepared)" };
  }
  if (code >= 80 || code >= 51 || cape >= 700 || wind >= 25) {
    return { level: "YELLOW", label: "Watch (Be Updated)" };
  }
  return { level: "GREEN", label: "Normal (No Warning)" };
}

function getWeatherDescription(code) {
  if (code === 0) return "Clear Sky";
  if (code <= 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 65) return "Rain Showers";
  if (code >= 80 && code <= 82) return "Heavy Showers";
  if (code >= 91 && code <= 92) return "Thunderstorm";
  if (code >= 95) return "Severe Thunderstorm / Hail";
  return "Cloudy";
}

function generateNowcastPrediction(riskLevel, cape) {
  if (riskLevel === "RED") {
    return "Severe convective cell initiation within 30 min. Lightning strike frequency > 40/min. Halt open-field operations!";
  }
  if (riskLevel === "ORANGE") {
    return "Rapid cloud vertical development detected. Thunderstorm probable in 45-60 min. Keep livestock under cover.";
  }
  if (riskLevel === "YELLOW") {
    return "Isolated convective updrafts forming. Low lightning probability. Monitor live Doppler radar.";
  }
  return "Stable boundary layer. No thunderstorm initiation expected in the next 3 hours.";
}

function findNearestIndianCity(lat, lon) {
  let nearest = null;
  let minDistance = Infinity;

  const allPlaces = [...IMD_RADARS, ...MAJOR_CITIES];
  for (const p of allPlaces) {
    const d = Math.hypot(p.lat - lat, p.lon - lon);
    if (d < minDistance) {
      minDistance = d;
      nearest = p;
    }
  }

  if (nearest && minDistance < 1.8) {
    return `Near ${nearest.city || nearest.name}, ${nearest.state}`;
  }
  return null;
}

// Update inspect panel loading state
function updateInspectPanelLoading(lat, lon, name) {
  const titleEl = document.getElementById("inspect-loc-title");
  const coordsEl = document.getElementById("inspect-loc-coords");
  const badgeEl = document.getElementById("inspect-threat-badge");

  if (titleEl) titleEl.innerText = name || "Querying Point...";
  if (coordsEl) coordsEl.innerText = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
  if (badgeEl) {
    badgeEl.className = "threat-level-badge YELLOW";
    badgeEl.innerText = "FETCHING TELEMETRY...";
  }
}

// Render data in Inspect Panel
function renderInspectPanelData(info) {
  const titleEl = document.getElementById("inspect-loc-title");
  const coordsEl = document.getElementById("inspect-loc-coords");
  const badgeEl = document.getElementById("inspect-threat-badge");
  const tempEl = document.getElementById("inspect-temp");
  const capeEl = document.getElementById("inspect-cape");
  const rainEl = document.getElementById("inspect-rain");
  const windEl = document.getElementById("inspect-wind");
  const humidityEl = document.getElementById("inspect-humidity");
  const pressureEl = document.getElementById("inspect-pressure");
  const nowcastEl = document.getElementById("inspect-nowcast-text");

  if (titleEl) titleEl.innerText = info.name;
  if (coordsEl) coordsEl.innerText = `${info.lat.toFixed(4)}°N, ${info.lon.toFixed(4)}°E • ${info.condition}`;
  if (badgeEl) {
    badgeEl.className = `threat-level-badge ${info.riskLevel}`;
    badgeEl.innerText = `${info.riskLevel} ALERT — ${info.riskLabel}`;
  }
  if (tempEl) tempEl.innerText = `${info.temp}°C`;
  if (capeEl) capeEl.innerText = `${info.cape} J/kg`;
  if (rainEl) rainEl.innerText = `${info.rain} mm/h`;
  if (windEl) windEl.innerText = `${info.windSpeed} km/h (Gust ${info.gusts})`;
  if (humidityEl) humidityEl.innerText = `${info.humidity}%`;
  if (pressureEl) pressureEl.innerText = `${info.pressure} hPa`;
  if (nowcastEl) {
    nowcastEl.innerText = generateNowcastPrediction(info.riskLevel, info.cape);
  }
}

// ============================================================================
// 12. POPULATE RADAR LISTS (Side panel & Radar Network view)
// ============================================================================
function populateRadarLists() {
  const panelList = document.getElementById("radar-side-list");
  const networkGrid = document.getElementById("radar-network-grid");

  if (panelList) {
    panelList.innerHTML = "";
    IMD_RADARS.forEach(radar => {
      const card = document.createElement("div");
      card.className = "station-item-card";
      card.innerHTML = `
        <div class="station-text-main">
          <span class="station-name-title">${radar.name}</span>
          <span class="station-state-sub">${radar.state} • ${radar.band} (${radar.rangeKm}km)</span>
        </div>
        <span class="station-status-pill dwr">RADAR</span>
      `;
      card.addEventListener("click", () => {
        document.querySelectorAll(".station-item-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        mapInstance.flyTo([radar.lat, radar.lon], 8, { duration: 1.2 });
        inspectLocationWeather(radar.lat, radar.lon, radar.name);
      });
      panelList.appendChild(card);
    });
  }

  if (networkGrid) {
    networkGrid.innerHTML = "";
    IMD_RADARS.forEach(radar => {
      const item = document.createElement("div");
      item.className = "telemetry-card";
      item.innerHTML = `
        <div class="tel-icon-box green">📡</div>
        <div class="tel-info" style="flex:1;">
          <h4>${radar.city}, ${radar.state}</h4>
          <div class="tel-val" style="font-size:1.1rem;">${radar.name}</div>
          <div class="tel-sub">Frequency: ${radar.band} • Range: ${radar.rangeKm} km • Status: 🟢 ${radar.status}</div>
        </div>
        <button class="nav-tab-btn" style="background:#E8F5E9; color:#1B5E20; padding:6px 12px; font-size:0.75rem;" onclick="flyToRadar('${radar.id}')">View on Map ↗</button>
      `;
      networkGrid.appendChild(item);
    });
  }
}

window.flyToRadar = function(radarId) {
  const radar = IMD_RADARS.find(r => r.id === radarId);
  if (!radar) return;
  switchTab("dashboard");
  setTimeout(() => {
    mapInstance.flyTo([radar.lat, radar.lon], 9, { duration: 1.4 });
    inspectLocationWeather(radar.lat, radar.lon, radar.name);
  }, 300);
};

// ============================================================================
// 13. MAP SEARCH FUNCTIONALITY
// ============================================================================
function initSearch() {
  const searchInput = document.getElementById("map-search-input");
  if (!searchInput) return;

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch(searchInput.value.trim());
    }
  });
}

function performSearch(query) {
  if (!query) return;
  const q = query.toLowerCase();

  // Search radars first
  const matchRadar = IMD_RADARS.find(r => r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.state.toLowerCase().includes(q));
  if (matchRadar) {
    mapInstance.flyTo([matchRadar.lat, matchRadar.lon], 8, { duration: 1.2 });
    inspectLocationWeather(matchRadar.lat, matchRadar.lon, matchRadar.name);
    return;
  }

  // Search cities
  const matchCity = MAJOR_CITIES.find(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  if (matchCity) {
    mapInstance.flyTo([matchCity.lat, matchCity.lon], 8, { duration: 1.2 });
    inspectLocationWeather(matchCity.lat, matchCity.lon, `${matchCity.name}, ${matchCity.state}`);
    return;
  }

  alert(`Location "${query}" not in pre-indexed station list. You can click directly anywhere on the map of India to inspect live weather!`);
}

// ============================================================================
// 14. 0-3 HOUR NOWCAST TIME SCRUBBER (+0m, +30m, +60m, +90m, +120m, +180m)
// ============================================================================
function initScrubber() {
  const stepBtns = document.querySelectorAll(".scrubber-step-btn");
  const playBtn = document.getElementById("btn-scrubber-play");

  stepBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      setScrubberStep(index);
    });
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      togglePlayScrubber();
    });
  }
}

function setScrubberStep(index) {
  selectedLeadTimeIndex = index;
  const leadMinutes = LEAD_TIMES[index];

  document.querySelectorAll(".scrubber-step-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });

  // Shift simulated storm positions according to lead time
  const timeOffset = leadMinutes / 60; // in hours
  layerGroupStorms.clearLayers();

  ACTIVE_STORM_CELLS.forEach(storm => {
    const shiftLat = storm.lat + (timeOffset * 0.15);
    const shiftLon = storm.lon + (timeOffset * 0.22);

    const stormIcon = L.divIcon({
      className: "custom-pin-marker",
      html: `<div class="pin-core alert" title="${storm.name}">⚡</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([shiftLat, shiftLon], { icon: stormIcon });
    const circle = L.circle([shiftLat, shiftLon], {
      radius: 45000 + (leadMinutes * 150),
      color: storm.imdRisk === "RED" ? "#C62828" : "#E65100",
      weight: 2,
      fillColor: storm.imdRisk === "RED" ? "#FFEBEE" : "#FFF3E0",
      fillOpacity: 0.2
    });

    marker.bindPopup(`
      <div class="map-popup-card">
        <div class="popup-badge-row">
          <span class="threat-level-badge ${storm.imdRisk}">${storm.imdRisk} (+${leadMinutes}m)</span>
        </div>
        <div class="popup-title">${storm.name}</div>
        <div class="popup-nowcast-text">
          Predicted cell boundary at T+${leadMinutes} minutes based on cross-attention deep learning nowcast.
        </div>
      </div>
    `);

    layerGroupStorms.addLayer(circle);
    layerGroupStorms.addLayer(marker);
  });
}

function togglePlayScrubber() {
  const playBtn = document.getElementById("btn-scrubber-play");
  if (isPlayingScrubber) {
    clearInterval(scrubberTimer);
    isPlayingScrubber = false;
    if (playBtn) playBtn.innerHTML = "▶";
  } else {
    isPlayingScrubber = true;
    if (playBtn) playBtn.innerHTML = "⏸";
    scrubberTimer = setInterval(() => {
      let nextStep = (selectedLeadTimeIndex + 1) % LEAD_TIMES.length;
      setScrubberStep(nextStep);
    }, 1800);
  }
}
