export interface Student {
  id: string;
  name: string;
  avatar: string; // Path to SVG or image
  questionId: string;
  position: { top: string; left: string };
}

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

export interface VisualizationData {
  questionId: string;
  type: 'bar' | 'line' | 'scatter';
  data: CountryData[];
  xLabel: string;
  yLabel: string;
  title: string;
}

