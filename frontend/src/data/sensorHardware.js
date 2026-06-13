// Maps sensor name patterns to hardware info from the WeatherLink sensor catalogue.
const HARDWARE_RULES = [
  { pattern: /Soil(Temp|Moisture)|^EC_/i,  manufacturer: "Sentek",            product: "Drill & Drop 60cm TriSCAN" },
  { pattern: /Rain|RainRate/i,              manufacturer: "Davis Instruments", product: "AeroCone Rain Collector (6466M)" },
  { pattern: /Wind/i,                       manufacturer: "Davis Instruments", product: "Anemometer (6410)" },
  { pattern: /Temp|Hum|DewPoint|HeatIndex|WetBulb|THW|THSW/i, manufacturer: "Davis Instruments", product: "Temp/Hum Sensor (6830)" },
  { pattern: /Barometer|BarTrend/i,         manufacturer: "Davis Instruments", product: "Barometer" },
  { pattern: /Solar|UV/i,                   manufacturer: "Davis Instruments", product: "Solar/UV Sensor" },
  { pattern: /Flow/i,                       manufacturer: "Generic",           product: "Flow Meter (1L/pulse)" },
  { pattern: /Depth|Level|Hydros/i,         manufacturer: "Meter",             product: "Hydros 21" },
];

export function getHardwareInfo(sensorName) {
  for (const rule of HARDWARE_RULES) {
    if (rule.pattern.test(sensorName)) {
      return { manufacturer: rule.manufacturer, product: rule.product };
    }
  }
  return null;
}
