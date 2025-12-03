export interface Question {
  id: string;
  text: string;
  topic: 'Math' | 'Reading' | 'Science' | 'General';
  description: string;
}

export interface CountryData {
  country: string;
  value: number;
  region: string;
}

export interface ClockData {
  country: string;
  startTime: number[];
  endTime: number[];
  cramSchoolStartTime?: number;
  cramSchoolEndTime?: number;
}

export interface HistogramData {
  country: string;
  BELONG: number | null;
  BULLIED: number | null;
  FEELSAFE: number | null;
}

export interface SocioeconomicBin {
  binStart: number;
  binEnd: number;
  count: number;
}

export interface SocioeconomicData {
  country: string;
  ESCS: number | null;
  HISCED: number | null;
  HISEI: number | null;
  escsDistribution: SocioeconomicBin[];
}

export interface VisualizationData {
  questionId: string;
  type: 'bar' | 'line' | 'scatter' | 'clock' | 'histogram' | 'socioeconomic';
  data: CountryData[] | ClockData[] | HistogramData[] | SocioeconomicData[];
  xLabel: string;
  yLabel: string;
  title: string;
}

export interface OpinionSubmission {
  id: string;
  timestamp: string;
  bestCountry: string;
  worstCountry: string;
}
