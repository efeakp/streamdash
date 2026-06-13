// UoH campus sensor nodes extracted from WeatherLink sensor catalogue.
// Each node has GPS coordinates and the sensor categories deployed there.

const CATEGORY_COLOUR = {
  "Soil Moisture":          "#4caf50",
  "Rain":                   "#2196f3",
  "Depth & Level Sensors":  "#00bcd4",
  "Flow Meter":             "#ff9800",
  "Temp/Hum":               "#9c27b0",
  "Wind":                   "#673ab7",
  "Air Quality":            "#f44336",
  "Barometer":              "#607d8b",
  "Solar Radiation":        "#ffc107",
  "Ultra Violet":           "#ff5722",
  "ISS":                    "#795548",
};

// Priority order for choosing a node's marker colour
const PRIORITY = [
  "Depth & Level Sensors", "Flow Meter", "Soil Moisture", "Rain",
  "Temp/Hum", "Wind", "Air Quality", "Barometer", "Solar Radiation",
  "Ultra Violet", "ISS",
];

function primaryColour(categories) {
  for (const cat of PRIORITY) {
    if (categories.includes(cat)) return CATEGORY_COLOUR[cat] ?? "#999";
  }
  return "#999";
}

function cleanName(raw) {
  return raw
    .replace(/SuDSLaB-UoH-|SuDSLab-UoH-|SUDSlab-UoH-|SuDSLab-UoH-|SuDSlabUK-/gi, "")
    .replace(/-UoH$/i, "")
    .replace(/-/g, " ")
    .trim();
}

const RAW_NODES = [
  { name: "Pod1",                          lat: 53.772278,  lon: -0.36558184,  categories: ["Flow Meter"] },
  { name: "Pod2",                          lat: 53.772278,  lon: -0.36558178,  categories: ["Depth & Level Sensors"] },
  { name: "SUDSlab-UoH-Newland-001",       lat: 53.77279,   lon: -0.36431137,  categories: ["Soil Moisture", "Rain"] },
  { name: "Seneye",                        lat: 53.769997,  lon: -0.36727783,  categories: ["Depth & Level Sensors"] },
  { name: "Seneye2",                       lat: 53.770134,  lon: -0.36715615,  categories: ["Depth & Level Sensors"] },
  { name: "SuDSLaB-UoH-Wilberforce-002",  lat: 53.771324,  lon: -0.36427683,  categories: ["Temp/Hum", "Soil Moisture", "Depth & Level Sensors"] },
  { name: "SuDSLab-UoH-AirkLink",         lat: 53.772575,  lon: -0.37359613,  categories: ["Air Quality"] },
  { name: "SuDSLab-UoH-Library-001",      lat: 53.770977,  lon: -0.36904648,  categories: ["Temp/Hum", "Wind", "Rain"] },
  { name: "SuDSLab-UoH-Planter-002",      lat: 53.77103,   lon: -0.36783713,  categories: ["Temp/Hum", "Rain"] },
  { name: "SuDSLab-UoH-Planter-003",      lat: 53.771587,  lon: -0.36725712,  categories: ["Rain"] },
  { name: "SuDSLab-UoH-Planter-004",      lat: 53.771595,  lon: -0.36743212,  categories: ["Temp/Hum", "Soil Moisture", "Rain"] },
  { name: "SuDSLab-UoH-Planter-005",      lat: 53.7716,    lon: -0.36776808,  categories: ["Soil Moisture", "Rain"] },
  { name: "SuDSLab-UoH-Planter-006",      lat: 53.772247,  lon: -0.36513785,  categories: ["Soil Moisture", "Flow Meter"] },
  { name: "SuDSLab-UoH-Planter-007A",     lat: 53.771996,  lon: -0.36519316,  categories: ["Temp/Hum", "Soil Moisture", "Flow Meter"] },
  { name: "SuDSlab-UoH-Planter-001",      lat: 53.771168,  lon: -0.36781368,  categories: ["Soil Moisture", "Rain"] },
  { name: "SuDSlab-UoH-Salmon-001",       lat: 53.7702,    lon: -0.36642194,  categories: ["Temp/Hum", "Soil Moisture", "Rain"] },
  { name: "SuDSlab-UoH-Sports-001",       lat: 53.77255,   lon: -0.36763832,  categories: ["Temp/Hum", "Soil Moisture", "Rain"] },
  { name: "SuDSlab-UoH-Venn-001",         lat: 53.769325,  lon: -0.36857072,  categories: ["Temp/Hum", "Soil Moisture", "Depth & Level Sensors", "Rain"] },
  { name: "SuDSlab-UoH-Westfield-001",    lat: 53.77301,   lon: -0.37240258,  categories: ["Soil Moisture", "Depth & Level Sensors"] },
  { name: "SuDSlab-UoH-Westfield-002",    lat: 53.771214,  lon: -0.37209046,  categories: ["Temp/Hum", "Soil Moisture", "Depth & Level Sensors", "Rain"] },
  { name: "SuDSlab-UoH-Wilberforce-001",  lat: 53.771343,  lon: -0.36361802,  categories: ["Soil Moisture", "Depth & Level Sensors", "Rain"] },
  { name: "SuDSlabUK-UoH",               lat: 53.77265,   lon: -0.37362,     categories: ["Barometer", "Solar Radiation", "Ultra Violet", "ISS"] },
];

export const UOH_NODES = RAW_NODES.map((n) => ({
  ...n,
  label: cleanName(n.name),
  colour: primaryColour(n.categories),
}));

export { CATEGORY_COLOUR };
