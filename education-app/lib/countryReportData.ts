import Papa from 'papaparse';

export type CountryId = "US" | "Finland" | "Cambodia" | "Singapore" | "Japan" | "Brazil";

export interface CountryEducationStats {
  id: CountryId;
  name: string;
  mathScore: number;        // math_score (~300-600)
  escs: number;             // ESCS (~ -2.5 to 1.5)
  hisei: number;            // HISEI (Highest Parental Occupation Status, ~20-90)
  hisced: number;           // HISCED (Highest Parental Education Level, 0-6 PISA scale)
  senseOfBelonging: number; // sense_of_belonging (Index, ~ -0.5 to 0.5)
  bullying: number;         // bullying (Index, ~ -1.5 to 0) - Lower is better/less bullying
  feelsSafe: number | null; // feeling_safe (Index, ~ -1 to 1) - Higher is better
}

// Fallback Mock Data (Approximated from CSV for initial state)
const DEFAULT_COUNTRY_STATS: CountryEducationStats[] = [
  {
    id: "US",
    name: "United States",
    mathScore: 465,
    escs: 0.16,
    hisei: 60,
    hisced: 6,
    senseOfBelonging: -0.26, 
    bullying: -0.29,        
    feelsSafe: -0.20,
  },
  {
    id: "Finland",
    name: "Finland",
    mathScore: 484, 
    escs: 0.30,
    hisei: 56,
    hisced: 6,
    senseOfBelonging: 0.08,
    bullying: -0.39,
    feelsSafe: 0.34,
  },
  {
    id: "Cambodia",
    name: "Cambodia",
    mathScore: 337, 
    escs: -2.0,
    hisei: 30,
    hisced: 3.4,
    senseOfBelonging: -0.45,
    bullying: -0.09,
    feelsSafe: -0.57,
  },
  {
    id: "Singapore",
    name: "Singapore",
    mathScore: 575,
    escs: 0.48,
    hisei: 70,
    hisced: 6,
    senseOfBelonging: -0.34,
    bullying: -0.21,
    feelsSafe: 0.44,
  },
  {
    id: "Japan",
    name: "Japan",
    mathScore: 536,
    escs: 0.03,
    hisei: 57,
    hisced: 6,
    senseOfBelonging: 0.24, 
    bullying: -0.73,
    feelsSafe: null, 
  },
  {
    id: "Brazil",
    name: "Brazil",
    mathScore: 379,
    escs: -0.98,
    hisei: 42,
    hisced: 5.0,
    senseOfBelonging: -0.20,
    bullying: -0.15,
    feelsSafe: -0.40,
  },
];

// Helper to normalize values 0-1 for visualization bars
export function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

// Helper to calculate composite score
export function calculateCompositeScore(stats: CountryEducationStats): number {
  // Ranges observed in data:
  // Math: 326 - 582 -> Range ~256
  // ESCS: -2.1 - 0.48 -> Range ~2.6
  // HISEI: 24 - 70 -> Range ~46
  // HISCED: 3.4 - 6.0 -> Range ~2.6
  // Belonging: -0.44 - 0.24 -> Range ~0.68
  // Safe: -0.76 - 0.69 -> Range ~1.45
  // Bullying: -1.23 - -0.09 -> Range ~1.14 (Note: PISA bullying index is often negative = less bullying, or standardized)
  
  // Normalization logic:
  // We want each factor to contribute roughly equally to a 0-100 scale score.
  
  // Math (0-100 contribution): 
  // (Val - 300) / 300 * 25 (weight) -> 300=0, 600=25pts
  const scoreMath = ((stats.mathScore - 300) / 300) * 25; 

  // Socio-Economic (ESCS + HISEI + HISCED combined ~ 25 pts)
  // ESCS: (-2 to 1) -> normalized 0-1 * 10pts
  const scoreEscs = ((stats.escs + 2.5) / 3.5) * 10;
  
  // HISEI: (20 to 80) -> normalized 0-1 * 7.5pts
  const scoreHisei = ((stats.hisei - 20) / 60) * 7.5;

  // HISCED: (0 to 6) -> normalized 0-1 * 7.5pts
  const scoreHisced = ((stats.hisced - 0) / 6) * 7.5;

  // Well-being (Belonging + Safety ~ 25 pts)
  // Belonging: (-0.5 to 0.5) -> normalized 0-1 * 12.5pts
  const scoreBelong = ((stats.senseOfBelonging + 0.5) / 1.0) * 12.5;

  // Safety: (-1 to 1) -> normalized 0-1 * 12.5pts
  // Handle missing Japan safe data (neutral 0 score -> 0.5 normalized)
  const safeVal = stats.feelsSafe !== null ? stats.feelsSafe : 0;
  const scoreSafe = ((safeVal + 1) / 2) * 12.5;

  // Bullying (Negative impact, ~25 pts)
  // Range -1.3 (good) to 0 (bad). 
  // We want LOW bullying (more negative) to be GOOD.
  // Normalized "Badness" 0-1: (Val - (-1.5)) / 1.5. 
  // -1.5 -> 0 badness. 0 -> 1 badness.
  const scoreBullyBadness = ((stats.bullying + 1.5) / 1.5) * 25;

  // Total Score = Positives - Negative Impact
  const total = (scoreMath + scoreEscs + scoreHisei + scoreHisced + scoreBelong + scoreSafe) - scoreBullyBadness;

  return total;
}

export function getRankedCountries(stats: CountryEducationStats[] = DEFAULT_COUNTRY_STATS) {
  const dataToUse = stats && stats.length > 0 ? stats : DEFAULT_COUNTRY_STATS;
  const scored = dataToUse.map(c => ({
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

// Async loader for client-side
export async function fetchCountryStats(): Promise<CountryEducationStats[]> {
  try {
    const response = await fetch('/country_education_summary.csv');
    const text = await response.text();
    
    const result = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    const data = result.data as any[];
    
    return data.map((row: any) => {
      // Map 'country' to CountryId if strictly typed, or just string
      // Our CSV has "US", "Finland", etc.
      return {
        id: row.country as CountryId,
        name: row.country === 'US' ? 'United States' : row.country,
        mathScore: row.math_score,
        escs: row.ESCS,
        hisei: row.HISEI,
        hisced: row.HISCED, // New Field
        senseOfBelonging: row.sense_of_belonging,
        bullying: row.bullying,
        feelsSafe: (row.feeling_safe === "" || row.feeling_safe === null) ? null : Number(row.feeling_safe)
      };
    });
  } catch (error) {
    console.error("Failed to fetch CSV data:", error);
    return DEFAULT_COUNTRY_STATS;
  }
}

// Export default stats for immediate use
export const COUNTRY_STATS = DEFAULT_COUNTRY_STATS;
