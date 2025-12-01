"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HistogramData } from "@/lib/types";

interface HistogramChartProps {
  data: HistogramData[];
  filteredCountries: string[];
  selectedMetrics: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const colors = {
  BELONG: "#81d4fa", // chalk-blue
  BULLIED: "#ef9a9a", // chalk-red
  FEELSAFE: "#fff59d", // chalk-yellow
};

export function HistogramChart({
  data,
  filteredCountries,
  selectedMetrics,
  sortBy,
  sortOrder,
}: HistogramChartProps) {
  // Filter by countries
  const filteredData = useMemo(() => {
    return data.filter(
      (d) =>
        filteredCountries.length === 0 || filteredCountries.includes(d.country)
    );
  }, [data, filteredCountries]);

  // Filter data to only include selected metrics and sort
  const chartData = useMemo(() => {
    const metricsSet = new Set(selectedMetrics);
    // Include all metrics in data for sorting purposes
    let processed = filteredData.map((country) => {
      return {
        country: country.country,
        BELONG: country.BELONG,
        BULLIED: country.BULLIED,
        FEELSAFE: country.FEELSAFE,
      };
    });

    // Sort data based on selected metric
    if (
      sortBy !== "none" &&
      (sortBy === "BELONG" || sortBy === "BULLIED" || sortBy === "FEELSAFE")
    ) {
      processed = [...processed].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        // Handle null/undefined values - put them at the end
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Sort based on order
        if (sortOrder === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    // Now filter out metrics that aren't selected (after sorting)
    return processed.map((item) => {
      const filtered: Record<string, any> = { country: item.country };
      if (metricsSet.has("BELONG")) {
        filtered.BELONG = item.BELONG;
      }
      if (metricsSet.has("BULLIED")) {
        filtered.BULLIED = item.BULLIED;
      }
      if (metricsSet.has("FEELSAFE")) {
        filtered.FEELSAFE = item.FEELSAFE;
      }
      return filtered;
    });
  }, [filteredData, selectedMetrics, sortBy, sortOrder]);

  if (filteredData.length === 0) {
    return (
      <div className="text-center text-chalk-white/50 italic py-8">
        No countries selected. Use the filter panel to select countries.
      </div>
    );
  }

  const metricsSet = new Set(selectedMetrics);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart */}
      {selectedMetrics.length > 0 ? (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis type="number" tick={{ fill: "#fcfcfc", fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="country"
                tick={{ fill: "#fcfcfc", fontSize: 10 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fcfcfc",
                }}
                formatter={(value: any) => {
                  if (value == null || value === undefined) {
                    return "N/A";
                  }
                  return Number(value).toFixed(4);
                }}
              />
              <Legend
                wrapperStyle={{ color: "#fcfcfc", fontSize: "10px" }}
                iconType="square"
              />
              {metricsSet.has("BELONG") && (
                <Bar
                  dataKey="BELONG"
                  fill={colors.BELONG}
                  name="Belong"
                  radius={[0, 4, 4, 0]}
                />
              )}
              {metricsSet.has("BULLIED") && (
                <Bar
                  dataKey="BULLIED"
                  fill={colors.BULLIED}
                  name="Bullied"
                  radius={[0, 4, 4, 0]}
                />
              )}
              {metricsSet.has("FEELSAFE") && (
                <Bar
                  dataKey="FEELSAFE"
                  fill={colors.FEELSAFE}
                  name="Feel Safe"
                  radius={[0, 4, 4, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-chalk-white/50 italic">
          No metrics selected. Please select at least one metric to display.
        </div>
      )}
    </div>
  );
}
