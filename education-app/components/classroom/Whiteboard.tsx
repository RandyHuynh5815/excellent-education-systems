"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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
  SocioeconomicData,
} from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { SpiderRadarChart } from "./SpiderRadarChart";
import { SlideDeck } from "./SlideDeck";
import { Radar, BookOpen, BarChart3, Clock as ClockIcon, Users } from "lucide-react";
import Clock from "@/components/Clock";
import { HistogramChart } from "./HistogramChart";
import { ClockChart } from "./ClockChart";
import { SocioeconomicChart } from "./SocioeconomicChart";
import { VISUALIZATIONS } from "@/lib/data";

type ViewMode = "spider" | "clock" | "slides" | "question";

interface WhiteboardProps {
  data: VisualizationData | null;
  question: Question | null;
  filteredCountries: string[];
  // Histogram-specific props
  selectedMetrics?: string[];
  histogramSortBy?: string;
  histogramSortOrder?: "asc" | "desc";
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    payload?: { country?: string };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && payload[0]) {
    return (
      <div className="bg-black/80 border border-chalk-white p-3 rounded shadow-lg">
        <p className="text-chalk-white font-bold">
          {label || payload[0].payload?.country}
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
  const hasStudentData = data && question;
  const [manualViewMode, setManualViewMode] = useState<ViewMode | null>(null);

  // Determine view mode: use manual override if set and valid, otherwise default based on student data
  const viewMode: ViewMode = (() => {
    // For clock, histogram, and socioeconomic types, always show tabs and allow switching
    if (data?.type === "clock" || data?.type === "histogram" || data?.type === "socioeconomic") {
      return manualViewMode || "question";
    }

    if (manualViewMode) {
      // If manual override is set, use it
      // Allow clock and spider/slides even without student data
      if (
        hasStudentData ||
        manualViewMode === "clock" ||
        manualViewMode === "spider" ||
        manualViewMode === "slides"
      ) {
        return manualViewMode;
      }
      // Invalid state: no student data but trying to show question - fall back to spider
      return "spider";
    }
    // No manual override, use default
    return hasStudentData ? "question" : "spider";
  })();

  // Show navigation tabs when no student is selected
  if (!data || !question) {
    const clockData = (VISUALIZATIONS["q4"]?.data as ClockData[]) || [];

    return (
      <div className="w-full h-full flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-4 border-b-2 border-chalk-white/20">
          <button
            onClick={() => setManualViewMode("spider")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "spider"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <Radar size={18} />
            <span>Radar Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("clock")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "clock"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <ClockIcon size={18} />
            <span>Clock Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("slides")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "slides"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <BookOpen size={18} />
            <span>Country Facts</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {viewMode === "spider" && (
              <motion.div
                key="spider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <SpiderRadarChart />
              </motion.div>
            )}
            {viewMode === "clock" && (
              <motion.div
                key="clock"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ClockChart
                  data={clockData}
                  title="School Day Schedules by Country"
                  description="Select up to 3 countries to compare their school day schedules."
                />
              </motion.div>
            )}
            {viewMode === "slides" && (
              <motion.div
                key="slides"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <SlideDeck />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Handle clock visualization type
  if (data.type === "clock") {
    const clockData = data.data as ClockData[];

    return (
      <div className="w-full min-h-full flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-4 border-b-2 border-chalk-white/20">
          <button
            onClick={() => setManualViewMode("question")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "question"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <ClockIcon size={18} />
            <span>Clock Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("spider")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "spider"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <Radar size={18} />
            <span>Radar Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("slides")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "slides"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <BookOpen size={18} />
            <span>Country Facts</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {viewMode === "question" && (
              <motion.div
                key="clock"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ClockChart
                  data={clockData}
                  title={question.text}
                  description={question.description}
                />
              </motion.div>
            )}
            {viewMode === "spider" && (
              <motion.div
                key="spider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SpiderRadarChart
                  maxCountries={3}
                  title="Country Comparison Radar Chart"
                  description="Select up to 3 countries to compare their percentile scores across multiple dimensions."
                />
              </motion.div>
            )}
            {viewMode === "clock" && (
              <motion.div
                key="clock"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ClockChart
                  data={clockData}
                  title="School Day Schedules by Country"
                  description="Select up to 3 countries to compare their school day schedules."
                />
              </motion.div>
            )}
            {viewMode === "slides" && (
              <motion.div
                key="slides"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SlideDeck />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Handle histogram visualization type
  if (data.type === "histogram") {
    const histogramData = data.data as HistogramData[];
    const clockData = (VISUALIZATIONS["q4"]?.data as ClockData[]) || [];

    return (
      <div className="w-full min-h-full flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-4 border-b-2 border-chalk-white/20">
          <button
            onClick={() => setManualViewMode("question")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "question"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <BarChart3 size={18} />
            <span>Student Question</span>
          </button>
          <button
            onClick={() => setManualViewMode("spider")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "spider"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <Radar size={18} />
            <span>Radar Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("clock")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "clock"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <ClockIcon size={18} />
            <span>Clock Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("slides")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "slides"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <BookOpen size={18} />
            <span>Country Facts</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {viewMode === "question" && (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col p-4"
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
            )}
            {viewMode === "spider" && (
              <motion.div
                key="spider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SpiderRadarChart
                  maxCountries={3}
                  title="Country Comparison Radar Chart"
                  description="Select up to 3 countries to compare their percentile scores across multiple dimensions."
                />
              </motion.div>
            )}
            {viewMode === "clock" && (
              <motion.div
                key="clock"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ClockChart
                  data={clockData}
                  title="School Day Schedules by Country"
                  description="Select up to 3 countries to compare their school day schedules."
                />
              </motion.div>
            )}
            {viewMode === "slides" && (
              <motion.div
                key="slides"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SlideDeck />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Handle socioeconomic visualization type
  if (data.type === "socioeconomic") {
    const socioeconomicData = data.data as SocioeconomicData[];
    const clockData = (VISUALIZATIONS["q4"]?.data as ClockData[]) || [];

    return (
      <div className="w-full min-h-full flex flex-col">
        {/* Navigation Tabs - Radar Chart, Clock Chart, Country Facts only */}
        <div className="flex gap-2 p-4 border-b-2 border-chalk-white/20">
          <button
            onClick={() => setManualViewMode("spider")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "spider"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <Radar size={18} />
            <span>Radar Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("clock")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "clock"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <ClockIcon size={18} />
            <span>Clock Chart</span>
          </button>
          <button
            onClick={() => setManualViewMode("slides")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === "slides"
                ? "bg-chalk-yellow text-black font-semibold"
                : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
            }`}
          >
            <BookOpen size={18} />
            <span>Country Facts</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {viewMode === "question" && (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <SocioeconomicChart
                  data={socioeconomicData}
                  title={question.text}
                  description={question.description}
                />
              </motion.div>
            )}
            {viewMode === "spider" && (
              <motion.div
                key="spider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SpiderRadarChart
                  maxCountries={3}
                  title="Country Comparison Radar Chart"
                  description="Select up to 3 countries to compare their percentile scores across multiple dimensions."
                />
              </motion.div>
            )}
            {viewMode === "clock" && (
              <motion.div
                key="clock"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ClockChart
                  data={clockData}
                  title="School Day Schedules by Country"
                  description="Select up to 3 countries to compare their school day schedules."
                />
              </motion.div>
            )}
            {viewMode === "slides" && (
              <motion.div
                key="slides"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SlideDeck />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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

  // For clock and histogram types, they're already handled above, so this is for bar/scatter types
  // Show navigation tabs for student questions
  const clockData = (VISUALIZATIONS["q4"]?.data as ClockData[]) || [];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Navigation Tabs for Student Questions */}
      <div className="flex gap-2 p-4 border-b-2 border-chalk-white/20">
        <button
          onClick={() => setManualViewMode("question")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "question"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <BarChart3 size={18} />
          <span>Student Question</span>
        </button>
        <button
          onClick={() => setManualViewMode("spider")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "spider"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <Radar size={18} />
          <span>Radar Chart</span>
        </button>
        <button
          onClick={() => setManualViewMode("clock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "clock"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <ClockIcon size={18} />
          <span>Clock Chart</span>
        </button>
        <button
          onClick={() => setManualViewMode("slides")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "slides"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <BookOpen size={18} />
          <span>Country Facts</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative p-6">
        <AnimatePresence mode="wait">
          {viewMode === "question" && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full"
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
          )}
          {viewMode === "spider" && (
            <motion.div
              key="spider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <SpiderRadarChart />
            </motion.div>
          )}
          {viewMode === "clock" && (
            <motion.div
              key="clock"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ClockChart
                data={clockData}
                title="School Day Schedules by Country"
                description="Select up to 2 countries to compare their school day schedules."
              />
            </motion.div>
          )}
          {viewMode === "slides" && (
            <motion.div
              key="slides"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <SlideDeck />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
