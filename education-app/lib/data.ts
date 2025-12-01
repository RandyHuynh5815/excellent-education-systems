import { Student, Question, VisualizationData } from './types';

export const STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Alice',
    avatar: '/avatars/student1.svg',
    questionId: 'q1',
    position: { top: '88%', left: '25%' },
  },
  {
    id: 's2',
    name: 'Bob',
    avatar: '/avatars/student2.svg',
    questionId: 'q2',
    position: { top: '88%', left: '50%' },
  },
  {
    id: 's3',
    name: 'Charlie',
    avatar: '/avatars/student3.svg',
    questionId: 'q3',
    position: { top: '88%', left: '75%' },
  },
];

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Do students perform better in smaller classes?',
    topic: 'General',
    description: 'Correlation between class size and test scores across different countries.',
  },
  {
    id: 'q2',
    text: 'How does homework time affect math scores?',
    topic: 'Math',
    description: 'Average math scores vs. hours of homework per week.',
  },
  {
    id: 'q3',
    text: 'Is there a gender gap in science performance?',
    topic: 'Science',
    description: 'Comparison of science scores between boys and girls.',
  },
];

export const VISUALIZATIONS: Record<string, VisualizationData> = {
  q1: {
    questionId: 'q1',
    type: 'scatter',
    title: 'Class Size vs. Performance',
    xLabel: 'Average Class Size',
    yLabel: 'Test Score',
    data: [
      { country: 'Finland', value: 520, region: 'Europe' },
      { country: 'Japan', value: 530, region: 'Asia' },
      { country: 'USA', value: 490, region: 'North America' },
      { country: 'Brazil', value: 400, region: 'South America' },
      { country: 'Korea', value: 540, region: 'Asia' },
    ],
  },
  q2: {
    questionId: 'q2',
    type: 'bar',
    title: 'Math Scores by Homework Time',
    xLabel: 'Country',
    yLabel: 'Score',
    data: [
      { country: 'Singapore', value: 560, region: 'Asia' },
      { country: 'Canada', value: 510, region: 'North America' },
      { country: 'France', value: 495, region: 'Europe' },
      { country: 'Italy', value: 485, region: 'Europe' },
    ],
  },
  q3: {
    questionId: 'q3',
    type: 'bar',
    title: 'Gender Gap in Science',
    xLabel: 'Country',
    yLabel: 'Gap (Boys - Girls)',
    data: [
      { country: 'Jordan', value: -20, region: 'Asia' },
      { country: 'USA', value: 5, region: 'North America' },
      { country: 'UK', value: 2, region: 'Europe' },
      { country: 'Finland', value: -5, region: 'Europe' },
    ],
  },
};

