"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  filteredCountries?: string[]; // Optional - if not provided, use internal state
  selectedMetrics: string[];
  sortBy?: string; // Optional - if not provided, use internal state
  sortOrder?: "asc" | "desc"; // Optional - if not provided, use internal state
  title?: string;
  description?: string;
}

const colors = {
  BELONG: "#81d4fa", // chalk-blue
  BULLIED: "#ef9a9a", // chalk-red
  FEELSAFE: "#fff59d", // chalk-yellow
};

const METRICS = ["BELONG", "BULLIED", "FEELSAFE"];
const MAX_COUNTRIES = 6;

// Metric descriptions for tooltips
export const METRIC_DESCRIPTIONS: Record<
  string,
  { name: string; description: string; color: string }
> = {
  BELONG: {
    name: "Belong",
    description:
      "High values indicate that an average student felt a stronger sense of belonging at school. Low values indicate that they felt a weaker sense of belonging.",
    color: "#81d4fa", // chalk-blue
  },
  BULLIED: {
    name: "Bullied",
    description:
      "High values indicate an average student experienced less bullying at school. Low values indicate that they experienced more bullying.",
    color: "#ef9a9a", // chalk-red
  },
  FEELSAFE: {
    name: "Feel Safe",
    description:
      "High values indicate that an average student felt safer at school. Low values indicate that they felt less safe.",
    color: "#fff59d", // chalk-yellow
  },
};

export function HistogramChart({
  data,
  selectedMetrics,
  title = "Mental Health and Well Being",
  description = "Compare the z-scores of a student's well being (bullying, feel safe, belonging) compared across different countries.",
}: HistogramChartProps) {
  // Get available countries from data first
  const availableCountries = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.country))).sort();
  }, [data]);

  // Internal state for country filter - initialize with first 3 countries
  const [internalFilteredCountries, setInternalFilteredCountries] = useState<
    string[]
  >(() => availableCountries.slice(0, MAX_COUNTRIES));
  const [internalSortBy, setInternalSortBy] = useState<string>("none");
  const [internalSortOrder, setInternalSortOrder] = useState<"asc" | "desc">(
    "asc"
  );
  // Track if Japan was selected before switching to FEELSAFE
  const japanWasSelectedRef = useRef<boolean>(false);

  // Always use internal state for the component's own filters and sort controls
  // External props are ignored when the component has its own UI controls
  // This allows the filters and sort to work independently
  const filteredCountries = internalFilteredCountries;
  const sortBy = internalSortBy;
  const sortOrder = internalSortOrder;

  // Update internal state when availableCountries changes (e.g., data prop changes)
  // Only update if current selection is empty
  useEffect(() => {
    if (
      availableCountries.length > 0 &&
      internalFilteredCountries.length === 0
    ) {
      // Use a callback to avoid synchronous setState warning
      queueMicrotask(() => {
        setInternalFilteredCountries(
          availableCountries.slice(0, MAX_COUNTRIES)
        );
      });
    }
  }, [availableCountries, internalFilteredCountries.length]);

  // Auto-remove Japan when sorting by FEELSAFE, and restore it when switching away
  useEffect(() => {
    if (sortBy === "FEELSAFE") {
      // Check if Japan is currently selected before removing it
      setInternalFilteredCountries((current) => {
        const hadJapan = current.includes("Japan");
        japanWasSelectedRef.current = hadJapan;
        const withoutJapan = current.filter((c) => c !== "Japan");
        return withoutJapan;
      });
    } else {
      // When switching away from FEELSAFE, restore Japan if it was previously selected
      if (japanWasSelectedRef.current) {
        setInternalFilteredCountries((current) => {
          if (!current.includes("Japan") && current.length < MAX_COUNTRIES) {
            return [...current, "Japan"];
          }
          return current;
        });
        japanWasSelectedRef.current = false; // Reset the flag
      }
    }
  }, [sortBy]);

  // Filter by countries
  const filteredData = useMemo(() => {
    if (filteredCountries.length === 0) {
      return data; // Show all if no filter
    }
    return data.filter((d) => filteredCountries.includes(d.country));
  }, [data, filteredCountries]);

  // Handle country toggle
  const handleCountryToggle = (country: string) => {
    // Always update internal state - it will be used if external props are not provided
    setInternalFilteredCountries((current) => {
      const isSelected = current.includes(country);
      if (isSelected) {
        return current.filter((c) => c !== country);
      }
      if (current.length >= MAX_COUNTRIES) {
        return current;
      }
      return [...current, country];
    });
  };

  // Determine which metrics to display - if sorting, only show the sorted metric
  const displayedMetrics = useMemo(() => {
    if (
      sortBy !== "none" &&
      (sortBy === "BELONG" || sortBy === "BULLIED" || sortBy === "FEELSAFE")
    ) {
      return [sortBy];
    }
    return selectedMetrics;
  }, [selectedMetrics, sortBy]);

  // Filter data to only include selected metrics and sort
  const chartData = useMemo(() => {
    const metricsSet = new Set(displayedMetrics);
    // Include all metrics in data for sorting purposes
    // Invert BULLIED values for display (multiply by -1)
    let processed = filteredData.map((country) => {
      return {
        country: country.country,
        BELONG: country.BELONG,
        BULLIED: country.BULLIED != null ? -country.BULLIED : null,
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

    // Now filter out metrics that aren't displayed (after sorting)
    return processed.map((item) => {
      const filtered: Record<string, number | string | null> = {
        country: item.country,
      };
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
  }, [filteredData, displayedMetrics, sortBy, sortOrder]);

  const metricsSet = new Set(displayedMetrics);

  // Get available metrics for sort dropdown (only show selected metrics)
  const availableSortMetrics = useMemo(() => {
    return METRICS.filter((m) => selectedMetrics.includes(m));
  }, [selectedMetrics]);

  return (
    <div className="w-full h-full flex flex-col p-6 relative pointer-events-auto overflow-y-auto font-patrick">
      {/* Title and Description */}
      {title && (
        <div className="mb-3 border-b-2 border-white/20 pb-2">
          <h2 className="text-3xl text-chalk-white font-bold mb-2">{title}</h2>
          {description && (
            <p className="text-base text-chalk-white/70 italic">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Filters and Sort - Side by Side */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Country Filter Buttons */}
        <div className="flex-1 w-full md:w-auto">
          <h3 className="text-sm font-semibold text-chalk-white mb-2">
            Filter Countries (6 max)
          </h3>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {availableCountries.length === 0 ? (
              <p className="text-chalk-white/50 italic">
                No countries available.
              </p>
            ) : (
              availableCountries.map((country) => {
                const isSelected = filteredCountries.includes(country);
                // Disable Japan when sorting by FEELSAFE (no data available)
                const isJapanDisabled =
                  country === "Japan" && sortBy === "FEELSAFE";
                const isDisabled =
                  isJapanDisabled ||
                  (!isSelected && filteredCountries.length >= MAX_COUNTRIES);
                return (
                  <motion.button
                    key={country}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isDisabled) {
                        handleCountryToggle(country);
                      }
                    }}
                    disabled={isDisabled}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold
                      ${
                        isSelected
                          ? "bg-chalk-yellow text-black border-chalk-yellow shadow-lg"
                          : isDisabled
                          ? "bg-transparent text-chalk-white/30 border-chalk-white/20 cursor-not-allowed"
                          : "bg-transparent text-chalk-white border-chalk-white/40 hover:border-chalk-blue hover:text-chalk-blue hover:bg-white/5 cursor-pointer"
                      }
                    `}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    style={{ pointerEvents: isDisabled ? "none" : "auto" }}
                  >
                    {country}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Sort Filter */}
        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
          <div className="flex items-center gap-2">
            <label className="text-chalk-white text-sm font-semibold">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                // Always update internal state - it will be used if external props are not provided
                setInternalSortBy(e.target.value);
              }}
              className="px-3 py-1.5 rounded-lg bg-transparent border-2 border-chalk-white/40 text-chalk-white text-sm focus:outline-none focus:border-chalk-blue"
            >
              <option value="none">None</option>
              {availableSortMetrics.map((metric) => (
                <option key={metric} value={metric} className="bg-[#1a261d]">
                  {metric}
                </option>
              ))}
            </select>
          </div>
          {sortBy !== "none" && (
            <div className="flex items-center gap-2">
              <label className="text-chalk-white text-sm font-semibold">
                Order:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  // Always update internal state - it will be used if external props are not provided
                  setInternalSortOrder(e.target.value as "asc" | "desc");
                }}
                className="px-3 py-1.5 rounded-lg bg-transparent border-2 border-chalk-white/40 text-chalk-white text-sm focus:outline-none focus:border-chalk-blue"
              >
                <option value="asc" className="bg-[#1a261d]">
                  Ascending
                </option>
                <option value="desc" className="bg-[#1a261d]">
                  Descending
                </option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      {filteredData.length === 0 ? (
        <div className="text-center text-chalk-white/50 italic py-8 flex-1 flex items-center justify-center">
          {filteredCountries.length === 0
            ? "Select countries to display data."
            : "No data available for selected countries."}
        </div>
      ) : displayedMetrics.length > 0 ? (
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
              <XAxis
                type="number"
                tick={{
                  fill: "#fcfcfc",
                  fontSize: 16,
                  fontFamily:
                    'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
                }}
              />
              <YAxis
                type="category"
                dataKey="country"
                tick={{
                  fill: "#fcfcfc",
                  fontSize: 20,
                  fontFamily:
                    'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
                }}
                width={70}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) {
                    return null;
                  }

                  // Create a map of payload values for quick lookup
                  const payloadMap = new Map(
                    payload.map((entry) => [entry.dataKey, entry.value])
                  );

                  // Get metric names mapping
                  const metricNames: Record<string, string> = {
                    BELONG: "Belong",
                    BULLIED: "Bullied",
                    FEELSAFE: "Feel Safe",
                  };

                  return (
                    <div
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "#fcfcfc",
                        fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
                      }}
                    >
                      <p
                        style={{
                          fontWeight: "bold",
                          marginBottom: "8px",
                          fontSize: "20px",
                        }}
                      >
                        {label}
                      </p>
                      {displayedMetrics.map((metric) => {
                        const value = payloadMap.get(metric);
                        const isNA =
                          value == null ||
                          value === undefined ||
                          (typeof value === "number" && isNaN(value));
                        const metricColor =
                          colors[metric as keyof typeof colors] || "#fcfcfc";

                        return (
                          <p
                            key={metric}
                            style={{
                              color: metricColor,
                              margin: "4px 0",
                              fontSize: "18px",
                            }}
                          >
                            <span style={{ fontWeight: "bold" }}>
                              {metricNames[metric] || metric}:
                            </span>{" "}
                            {isNA ? (
                              <span style={{ fontStyle: "italic" }}>N/A</span>
                            ) : (
                              Number(value).toFixed(4)
                            )}
                          </p>
                        );
                      })}
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{
                  color: "#fcfcfc",
                  fontSize: "16px",
                  fontFamily:
                    'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
                }}
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
        <div className="text-center py-8 text-chalk-white/50 italic flex-1 flex items-center justify-center">
          No metrics selected. Please select at least one metric to display.
        </div>
      )}
    </div>
  );
}
