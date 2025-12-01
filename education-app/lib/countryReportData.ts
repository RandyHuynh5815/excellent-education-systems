export type CountryId = "US" | "Finland" | "Cambodia" | "Singapore" | "Japan" | "Brazil";

export interface CountryEducationStats {
  id: CountryId;
  name: string;
  mathScore: number;        // e.g. average math score
  escs: number;             // index of economic, social and cultural status (-3 to 3 approx)
  hisei: number;            // parental education level (0-100 approx)
  hise_i: number;           // parental occupational status (0-90 approx)
  senseOfBelonging: number; // 0–100 (derived or raw scale)
  bullying: number;         // 0–100 (higher = more bullying)
  feelsSafe: number;        // 0–100 (higher = feels safer)
}

export const COUNTRY_STATS: CountryEducationStats[] = [
  {
    id: "US",
    name: "United States",
    mathScore: 478,
    escs: 0.12,
    hisei: 75,
    hise_i: 65,
    senseOfBelonging: 0.15, // Standardized 
    bullying: 0.25,        // Standardized (0-1 approx range in PISA index) or raw
    feelsSafe: 80,
  },
  {
    id: "Finland",
    name: "Finland",
    mathScore: 500, // Roughly PISA 2018/2022 range
    escs: 0.35,
    hisei: 78,
    hise_i: 70,
    senseOfBelonging: 0.20,
    bullying: 0.15,
    feelsSafe: 90,
  },
  {
    id: "Cambodia",
    name: "Cambodia",
    mathScore: 340, // Mock value, PISA-D
    escs: -1.2,
    hisei: 40,
    hise_i: 35,
    senseOfBelonging: 0.40,
    bullying: 0.45,
    feelsSafe: 60,
  },
  {
    id: "Singapore",
    name: "Singapore",
    mathScore: 575,
    escs: 0.55,
    hisei: 80,
    hise_i: 72,
    senseOfBelonging: 0.25,
    bullying: 0.20,
    feelsSafe: 92,
  },
  {
    id: "Japan",
    name: "Japan",
    mathScore: 536,
    escs: 0.05,
    hisei: 74,
    hise_i: 68,
    senseOfBelonging: -0.20, // Lower sense of belonging in some PISA reports
    bullying: 0.30,
    feelsSafe: 85,
  },
  {
    id: "Brazil",
    name: "Brazil",
    mathScore: 379,
    escs: -0.80,
    hisei: 50,
    hise_i: 45,
    senseOfBelonging: 0.30,
    bullying: 0.35,
    feelsSafe: 50,
  },
];

// Helper to normalize values 0-1 for visualization bars
export function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

// Helper to calculate composite score
export function calculateCompositeScore(stats: CountryEducationStats): number {
  // Normalize each metric roughly to a 0-100 scale or z-score equivalent for equal weighting.
  // Using simplified normalization based on typical ranges in this mock dataset.
  
  // Weights (can be adjusted)
  const wMath = 1;
  const wEscs = 20; // escs is approx -1.5 to 1.5, so x20 brings it to ~30 range
  const wHisei = 0.5; // 0-90 -> ~45
  const wBelonging = 25; // -0.5 to 0.5 -> ~12.5 range, boost it
  const wSafe = 0.5; // 0-100 -> 50 range
  const wBullying = 25; // 0-1 approx -> 25 range

  const positiveScore = 
    (stats.mathScore * 0.1) + // e.g. 500 -> 50
    (stats.escs * 10) +       // e.g. 0.5 -> 5
    (stats.hisei * 0.5) +     // e.g. 80 -> 40
    (stats.senseOfBelonging * 20) + // e.g. 0.2 -> 4
    (stats.feelsSafe * 0.5);  // e.g. 90 -> 45
  
  const negativeScore = stats.bullying * 50; // higher bullying subtracts more

  return positiveScore - negativeScore;
}

export function getRankedCountries() {
  const scored = COUNTRY_STATS.map(c => ({
    ...c,
    composite: calculateCompositeScore(c)
  }));
  
  scored.sort((a, b) => b.composite - a.composite);
  
  return {
    best: scored[0],
    lowest: scored[scored.length - 1],
    allScored: scored
  };
}

