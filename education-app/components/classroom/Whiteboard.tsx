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
import { ClockData, HistogramData, SocioeconomicData } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { SpiderRadarChart } from "./SpiderRadarChart";
import { SlideDeck } from "./SlideDeck";
import {
  Radar,
  BookOpen,
  BarChart3,
  Clock as ClockIcon,
  Users,
} from "lucide-react";
import Clock from "@/components/Clock";
import { HistogramChart, METRIC_DESCRIPTIONS } from "./HistogramChart";
import { ClockChart } from "./ClockChart";
import { SocioeconomicChart } from "./SocioeconomicChart";
import { VISUALIZATIONS } from "@/lib/data";

type ViewMode = "spider" | "clock" | "histogram" | "socioeconomic" | "slides";

interface WhiteboardProps {
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
  filteredCountries,
  selectedMetrics = ["BELONG", "BULLIED", "FEELSAFE"],
  histogramSortBy = "none",
  histogramSortOrder = "asc",
}: WhiteboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("spider");

  const clockData = (VISUALIZATIONS["q4"]?.data as ClockData[]) || [];
  const histogramData = (VISUALIZATIONS["q5"]?.data as HistogramData[]) || [];
  const socioeconomicData =
    (VISUALIZATIONS["q6"]?.data as SocioeconomicData[]) || [];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="flex gap-1 p-2 border-b-2 border-chalk-white/20">
        <button
          onClick={() => setViewMode("spider")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg transition-all ${
            viewMode === "spider"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <Radar size={18} />
          <span>Overall Country Comparison</span>
        </button>
        <button
          onClick={() => setViewMode("clock")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg transition-all ${
            viewMode === "clock"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <ClockIcon size={18} />
          <span>Time Spent in School</span>
        </button>
        <button
          onClick={() => setViewMode("histogram")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg transition-all ${
            viewMode === "histogram"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <BarChart3 size={18} />
          <span>Mental Health and Well Being</span>
        </button>
        <button
          onClick={() => setViewMode("socioeconomic")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg transition-all ${
            viewMode === "socioeconomic"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <Users size={18} />
          <span>Family Socioeconomic Status</span>
        </button>
        <button
          onClick={() => setViewMode("slides")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg transition-all ${
            viewMode === "slides"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <BookOpen size={18} />
          <span>Mathematical Ranking</span>
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
              <ClockChart data={clockData} />
            </motion.div>
          )}
          {viewMode === "histogram" && (
            <motion.div
              key="histogram"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex gap-4 p-4"
            >
              {/* Main Chart Area */}
              <div className="flex-1 min-w-0">
                <HistogramChart
                  data={histogramData}
                  filteredCountries={filteredCountries}
                  selectedMetrics={selectedMetrics}
                  sortBy={histogramSortBy}
                  sortOrder={histogramSortOrder}
                />
              </div>

              {/* Metric Descriptions Panel */}
              <div className="w-80 flex-shrink-0 bg-black/20 backdrop-blur-sm border-2 border-white/10 rounded-xl p-6 overflow-y-auto">
                <h3 className="text-2xl text-chalk-yellow font-bold mb-4 text-center">
                  Metric Guide
                </h3>
                <div className="space-y-6">
                  {selectedMetrics?.map((metric) => {
                    const metricInfo = METRIC_DESCRIPTIONS[metric];
                    if (!metricInfo) return null;

                    return (
                      <div
                        key={metric}
                        className="bg-black/30 rounded-lg p-4 border-2 border-white/10"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-5 h-5 rounded"
                            style={{ backgroundColor: metricInfo.color }}
                          />
                          <h4 className="text-lg font-bold text-chalk-white">
                            {metricInfo.name}
                          </h4>
                        </div>
                        <p className="text-sm text-chalk-white/80 leading-relaxed">
                          {metricInfo.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
          {viewMode === "socioeconomic" && (
            <motion.div
              key="socioeconomic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <SocioeconomicChart data={socioeconomicData} />
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
