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
import { ClockData, HistogramData } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { SpiderRadarChart } from "./SpiderRadarChart";
import { SlideDeck } from "./SlideDeck";
import { Radar, BookOpen, BarChart3, Clock as ClockIcon } from "lucide-react";
import Clock from "@/components/Clock";
import { HistogramChart } from "./HistogramChart";
import { ClockChart } from "./ClockChart";
import { VISUALIZATIONS } from "@/lib/data";

type ViewMode = "spider" | "clock" | "histogram" | "slides";

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

  return (
    <div className="w-full h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-4 border-b-2 border-chalk-white/20">
        <button
          onClick={() => setViewMode("spider")}
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
          onClick={() => setViewMode("clock")}
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
          onClick={() => setViewMode("histogram")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "histogram"
              ? "bg-chalk-yellow text-black font-semibold"
              : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-chalk-white/10"
          }`}
        >
          <BarChart3 size={18} />
          <span>Histogram Chart</span>
        </button>
        <button
          onClick={() => setViewMode("slides")}
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
          {viewMode === "histogram" && (
            <motion.div
              key="histogram"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col p-4"
            >
              <HistogramChart
                data={histogramData}
                filteredCountries={filteredCountries}
                selectedMetrics={selectedMetrics}
                sortBy={histogramSortBy}
                sortOrder={histogramSortOrder}
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
