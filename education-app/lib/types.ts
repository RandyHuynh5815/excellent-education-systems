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

export interface VisualizationData {
  questionId: string;
  type: 'bar' | 'line' | 'scatter' | 'clock' | 'histogram';
  data: CountryData[] | ClockData[] | HistogramData[];
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
