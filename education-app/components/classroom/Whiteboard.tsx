"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import {
  VisualizationData,
  Question,
  ClockData,
  HistogramData,
} from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Clock from "@/components/Clock";
import { HistogramChart } from "./HistogramChart";

interface WhiteboardProps {
  data: VisualizationData | null;
  question: Question | null;
  filteredCountries: string[];
  // Histogram-specific props
  selectedMetrics?: string[];
  histogramSortBy?: string;
  histogramSortOrder?: "asc" | "desc";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-chalk-white p-3 rounded shadow-lg">
        <p className="text-chalk-white font-bold">
          {label || payload[0].payload.country}
        </p>
        <p className="text-chalk-yellow">
          {payload[0].name || "Value"}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function Whiteboard({
  data,
  question,
  filteredCountries,
  selectedMetrics = ["BELONG", "BULLIED", "FEELSAFE"],
  histogramSortBy = "none",
  histogramSortOrder = "asc",
}: WhiteboardProps) {
  if (!data || !question) {
    return (
      <div className="h-full w-full flex items-center justify-center text-chalk-white/50 italic">
        Select a student to see their question on the board...
      </div>
    );
  }

  // Handle clock visualization type
  if (data.type === "clock") {
    const clockData = data.data as ClockData[];
    const filteredClockData = clockData.filter(
      (d) =>
        filteredCountries.length === 0 || filteredCountries.includes(d.country)
    );

    return (
      <div className="w-full min-h-full flex flex-col p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="mb-4 border-b-2 border-white/20 pb-3 flex-shrink-0">
              <h2 className="text-2xl text-chalk-white font-bold mb-1">
                {question.text}
              </h2>
              <p className="text-sm text-chalk-white/70 italic">
                {question.description}
              </p>
            </div>

            <div className="flex-1 min-h-0">
              <div className="grid grid-cols-2 gap-6 justify-items-center pb-4">
                {filteredClockData.length > 0 ? (
                  filteredClockData.map((countryData) => (
                    <div
                      key={countryData.country}
                      className="flex flex-col items-center"
                    >
                      <Clock
                        startTime={countryData.startTime}
                        endTime={countryData.endTime}
                        cramSchoolStartTime={countryData.cramSchoolStartTime}
                        cramSchoolEndTime={countryData.cramSchoolEndTime}
                        title={countryData.country}
                        size={240}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-chalk-white/50 italic py-8">
                    No countries selected. Use the filter panel to select
                    countries.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Handle histogram visualization type
  if (data.type === "histogram") {
    const histogramData = data.data as HistogramData[];

    return (
      <div className="w-full min-h-full flex flex-col p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="mb-4 border-b-2 border-white/20 pb-3 flex-shrink-0">
              <h2 className="text-2xl text-chalk-white font-bold mb-1">
                {question.text}
              </h2>
              <p className="text-sm text-chalk-white/70 italic">
                {question.description}
              </p>
            </div>

            <div className="flex-1 min-h-0">
              <HistogramChart
                data={histogramData}
                filteredCountries={filteredCountries}
                selectedMetrics={selectedMetrics}
                sortBy={histogramSortBy}
                sortOrder={histogramSortOrder}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Filter data for other chart types
  const chartData = data.data.filter(
    (d: any) =>
      filteredCountries.length === 0 || filteredCountries.includes(d.country)
  );

  const renderChart = () => {
    switch (data.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis
                dataKey="country"
                stroke="#ffffff"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#ffffff" />
              <RechartsTooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Bar
                dataKey="value"
                name={data.yLabel}
                fill="#81d4fa"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#81d4fa", "#ffeb3b", "#ef9a9a"][index % 3]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis
                type="category"
                dataKey="country"
                name="Country"
                stroke="#ffffff"
              />
              <YAxis
                type="number"
                dataKey="value"
                name={data.yLabel}
                stroke="#ffffff"
              />
              <ZAxis range={[100, 300]} />
              <RechartsTooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter name={data.title} data={chartData} fill="#ffeb3b">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#81d4fa", "#ffeb3b", "#ef9a9a"][index % 3]}
                  />
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
    <div className="w-full min-h-full flex flex-col p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="mb-6 border-b-2 border-white/20 pb-4 flex-shrink-0">
            <h2 className="text-3xl text-chalk-white font-bold mb-2">
              {question.text}
            </h2>
            <p className="text-lg text-chalk-white/70 italic">
              {question.description}
            </p>
          </div>

          <div className="flex-1 min-h-0 relative">{renderChart()}</div>

          <div className="mt-4 text-center text-sm text-chalk-white/40 flex-shrink-0">
            Source: PISA 2022 (Mock Data)
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
