import { Student, Question, VisualizationData } from './types';

export const STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Alice',
    avatar: '/avatars/student1.svg',
    questionId: 'q1',
    position: { top: '85%', left: '10%' },
  },
  {
    id: 's2',
    name: 'Bob',
    avatar: '/avatars/student2.svg',
    questionId: 'q2',
    position: { top: '85%', left: '30%' },
  },
  {
    id: 's3',
    name: 'Charlie',
    avatar: '/avatars/student3.svg',
    questionId: 'q3',
    position: { top: '85%', left: '50%' },
  },
  {
    id: 's4',
    name: 'Diana',
    avatar: '/avatars/student4.svg',
    questionId: 'q4',
    position: { top: '85%', left: '70%' },
  },
  {
    id: 's5',
    name: 'Emma',
    avatar: '/avatars/student1.svg',
    questionId: 'q5',
    position: { top: '85%', left: '90%' },
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
  {
    id: 'q4',
    text: 'How do school day schedules compare across countries?',
    topic: 'General',
    description: 'Visualization of school day length and schedules, including regular school hours and cram school sessions.',
  },
  {
    id: 'q5',
    text: 'How do student well-being metrics compare across countries?',
    topic: 'General',
    description: 'Comparison of BELONG, BULLIED, and FEELSAFE values across selected countries.',
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
  q4: {
    questionId: 'q4',
    type: 'clock',
    title: 'School Day Schedules by Country',
    xLabel: '',
    yLabel: '',
    data: [
      {
        country: 'United States',
        startTime: [8],
        endTime: [15],
      },
      {
        country: 'Finland',
        startTime: [8],
        endTime: [15],
      },
      {
        country: 'Cambodia',
        startTime: [7, 13],
        endTime: [12, 17],
        cramSchoolStartTime: 17.5,
        cramSchoolEndTime: 19,
      },
      {
        country: 'Singapore',
        startTime: [7.5],
        endTime: [14],
        cramSchoolStartTime: 16,
        cramSchoolEndTime: 19,
      },
      {
        country: 'Japan',
        startTime: [8.75],
        endTime: [15.25],
        cramSchoolStartTime: 16,
        cramSchoolEndTime: 19,
      },
      {
        country: 'Brazil',
        startTime: [7],
        endTime: [12],
      },
    ],
  },
  q5: {
    questionId: 'q5',
    type: 'histogram',
    title: 'Student Well-being Metrics by Country',
    xLabel: 'Value',
    yLabel: 'Country',
    data: [
      {
        country: 'USA',
        BELONG: -0.26195708750680974,
        BULLIED: -0.2992250264908958,
        FEELSAFE: -0.1906859574937856,
      },
      {
        country: 'Finland',
        BELONG: 0.10115776003236154,
        BULLIED: -0.394384309295552,
        FEELSAFE: 0.3751167555018931,
      },
      {
        country: 'Cambodia',
        BELONG: -0.4270006898393434,
        BULLIED: -0.10140347109730738,
        FEELSAFE: -0.5926498057000327,
      },
      {
        country: 'Singapore',
        BELONG: -0.22485453435498354,
        BULLIED: -0.20990436925798034,
        FEELSAFE: 0.17657753533292245,
      },
      {
        country: 'Japan',
        BELONG: 0.24595837604595877,
        BULLIED: -0.7225585841894248,
        FEELSAFE: null,
      },
      {
        country: 'Brazil',
        BELONG: -0.20849259900791547,
        BULLIED: -0.1422153633658887,
        FEELSAFE: -0.4063129623409895,
      },
    ],
  },
};

