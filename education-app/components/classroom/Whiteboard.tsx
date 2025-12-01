'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { VisualizationData, Question } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface WhiteboardProps {
  data: VisualizationData | null;
  question: Question | null;
  filteredCountries: string[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; payload?: { country?: string } }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && payload[0]) {
    return (
      <div className="bg-black/80 border border-chalk-white p-3 rounded shadow-lg">
        <p className="text-chalk-white font-bold">{label || payload[0].payload?.country}</p>
        <p className="text-chalk-yellow">
          {payload[0].name || 'Value'}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function Whiteboard({ data, question, filteredCountries }: WhiteboardProps) {
  if (!data || !question) {
    return (
      <div className="h-full w-full flex items-center justify-center text-chalk-white/50 italic">
        Select a student to see their question on the board...
      </div>
    );
  }

  // Filter data
  const chartData = data.data.filter(d => 
    filteredCountries.length === 0 || filteredCountries.includes(d.country)
  );

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="country" stroke="#ffffff" angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#ffffff" />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" name={data.yLabel} fill="#81d4fa" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#81d4fa', '#ffeb3b', '#ef9a9a'][index % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis type="category" dataKey="country" name="Country" stroke="#ffffff" />
              <YAxis type="number" dataKey="value" name={data.yLabel} stroke="#ffffff" />
              <ZAxis range={[100, 300]} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name={data.title} data={chartData} fill="#ffeb3b">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#81d4fa', '#ffeb3b', '#ef9a9a'][index % 3]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <AnimatePresence mode="wait">
        <motion.div 
          key={question.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="mb-6 border-b-2 border-white/20 pb-4">
            <h2 className="text-3xl text-chalk-white font-bold mb-2">{question.text}</h2>
            <p className="text-lg text-chalk-white/70 italic">{question.description}</p>
          </div>

          <div className="flex-1 min-h-0 relative">
            {renderChart()}
          </div>
          
          <div className="mt-4 text-center text-sm text-chalk-white/40">
            Source: PISA 2022 (Mock Data)
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

