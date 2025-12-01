"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
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

// Data extracted from country_agg_life.csv
const HISTOGRAM_DATA = [
  {
    country: "USA",
    BELONG: -0.26195708750680974,
    BULLIED: -0.2992250264908958,
    FEELSAFE: -0.1906859574937856,
  },
  {
    country: "Finland",
    BELONG: 0.10115776003236154,
    BULLIED: -0.394384309295552,
    FEELSAFE: 0.3751167555018931,
  },
  {
    country: "Cambodia",
    BELONG: -0.4270006898393434,
    BULLIED: -0.10140347109730738,
    FEELSAFE: -0.5926498057000327,
  },
  {
    country: "Singapore",
    BELONG: -0.22485453435498354,
    BULLIED: -0.20990436925798034,
    FEELSAFE: 0.17657753533292245,
  },
  {
    country: "Japan",
    BELONG: 0.24595837604595877,
    BULLIED: -0.7225585841894248,
    FEELSAFE: null, // Missing value in CSV
  },
  {
    country: "Brazil",
    BELONG: -0.20849259900791547,
    BULLIED: -0.1422153633658887,
    FEELSAFE: -0.4063129623409895,
  },
];

export default function HistogramPage() {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(["BELONG", "BULLIED", "FEELSAFE"])
  );
  const [sortBy, setSortBy] = useState<string>("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(metric)) {
        newSet.delete(metric);
      } else {
        newSet.add(metric);
      }
      return newSet;
    });
  };

  // Filter data to only include selected metrics
  let chartData = HISTOGRAM_DATA.map((country) => {
    const filtered: Record<string, any> = { country: country.country };
    if (selectedMetrics.has("BELONG")) {
      filtered.BELONG = country.BELONG;
    }
    if (selectedMetrics.has("BULLIED")) {
      filtered.BULLIED = country.BULLIED;
    }
    if (selectedMetrics.has("FEELSAFE")) {
      filtered.FEELSAFE = country.FEELSAFE;
    }
    return filtered;
  });

  // Sort data based on selected metric
  if (
    sortBy !== "none" &&
    (sortBy === "BELONG" || sortBy === "BULLIED" || sortBy === "FEELSAFE")
  ) {
    chartData = [...chartData].sort((a, b) => {
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

  const colors = {
    BELONG: "#81d4fa", // chalk-blue
    BULLIED: "#ef9a9a", // chalk-red
    FEELSAFE: "#fff59d", // chalk-yellow
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#2d3e30]">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-50">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Button>
      </Link>

      <div className="z-10 max-w-7xl w-full bg-black/20 p-12 rounded-2xl backdrop-blur-sm border-2 border-white/10 shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-chalk-white text-center mb-6">
          Student Well-being Metrics by Country
        </h1>
        <p className="text-center text-chalk-white/80 mb-8 text-sm">
          Comparison of BELONG, BULLIED, and FEELSAFE values across selected
          countries
        </p>

        {/* Filter Section */}
        <div className="mb-8 p-4 bg-black/30 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-chalk-white mb-3 text-center">
            Select Metrics to Display
          </h3>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {["BELONG", "BULLIED", "FEELSAFE"].map((metric) => (
              <label
                key={metric}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border-2 transition-colors hover:bg-white/10"
                style={{
                  borderColor: selectedMetrics.has(metric)
                    ? colors[metric as keyof typeof colors]
                    : "rgba(255, 255, 255, 0.3)",
                  backgroundColor: selectedMetrics.has(metric)
                    ? `${colors[metric as keyof typeof colors]}33`
                    : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedMetrics.has(metric)}
                  onChange={() => handleMetricToggle(metric)}
                  className="w-4 h-4 cursor-pointer"
                  style={{
                    accentColor: colors[metric as keyof typeof colors],
                  }}
                />
                <span className="text-chalk-white text-sm font-medium">
                  {metric}
                </span>
              </label>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
            <label className="text-chalk-white text-sm font-medium flex items-center gap-2">
              Sort by:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-2 px-3 py-1.5 bg-black/40 border border-white/20 rounded text-chalk-white text-sm focus:outline-none focus:border-chalk-blue cursor-pointer"
              >
                <option value="none">None</option>
                <option value="BELONG">BELONG</option>
                <option value="BULLIED">BULLIED</option>
                <option value="FEELSAFE">FEELSAFE</option>
              </select>
            </label>
            {sortBy !== "none" && (
              <label className="text-chalk-white text-sm font-medium flex items-center gap-2">
                Order:
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="ml-2 px-3 py-1.5 bg-black/40 border border-white/20 rounded text-chalk-white text-sm focus:outline-none focus:border-chalk-blue cursor-pointer"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>
            )}
          </div>
        </div>

        {/* Chart */}
        {selectedMetrics.size > 0 ? (
          <div className="w-full h-[600px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 80, left: 100, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#fcfcfc", fontSize: 12 }}
                  label={{
                    value: "Value",
                    position: "insideBottom",
                    offset: -5,
                    style: { textAnchor: "middle", fill: "#fcfcfc" },
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={{ fill: "#fcfcfc", fontSize: 12 }}
                  width={80}
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
                <Legend wrapperStyle={{ color: "#fcfcfc" }} iconType="square" />
                {selectedMetrics.has("BELONG") && (
                  <Bar
                    dataKey="BELONG"
                    fill={colors.BELONG}
                    name="Belong"
                    radius={[0, 4, 4, 0]}
                  />
                )}
                {selectedMetrics.has("BULLIED") && (
                  <Bar
                    dataKey="BULLIED"
                    fill={colors.BULLIED}
                    name="Bullied"
                    radius={[0, 4, 4, 0]}
                  />
                )}
                {selectedMetrics.has("FEELSAFE") && (
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
          <div className="text-center py-12 text-chalk-white/60">
            <p>
              No metrics selected. Please select at least one metric to display.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-chalk-white/80">
          <p className="text-sm">
            This horizontal histogram compares student well-being metrics across
            different countries. Values are standardized scores where:
          </p>
          <ul className="text-xs mt-2 text-chalk-white/60 list-disc list-inside space-y-1">
            <li>
              <strong>BELONG</strong>: Sense of belonging (higher is better)
            </li>
            <li>
              <strong>BULLIED</strong>: Bullying frequency (lower is better)
            </li>
            <li>
              <strong>FEELSAFE</strong>: Feeling safe at school (higher is
              better)
            </li>
          </ul>
          <p className="text-xs mt-3 text-chalk-white/60">
            Note: Japan's FEELSAFE value is missing from the dataset.
          </p>
        </div>
      </div>
    </main>
  );
}
