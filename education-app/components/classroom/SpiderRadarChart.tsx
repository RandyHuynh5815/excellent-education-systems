"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { motion } from "framer-motion";

const DEFAULT_MAX_COUNTRIES = 3;

// Default country list used in your project; can be overridden via props
const DEFAULT_COUNTRIES = [
  "Brazil",
  "Cambodia",
  "Finland",
  "Japan",
  "Singapore",
  "United States",
];

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);

  // Parse CSV line handling quoted fields
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    // Push last field
    result.push(current.trim());

    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cols = parseLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] || "";
    });
    return obj;
  });

  return { headers, rows };
}

interface SpiderRadarChartProps {
  csvUrl?: string;
  countries?: string[];
  maxCountries?: number;
  title?: string;
  description?: string;
}

// Label definitions mapping
const LABEL_DEFINITIONS: Record<string, string> = {
  "Percentage of gov. spending on education":
    "Percent of the total government spending on education expenses",
  "Obesity rate per 100":
    "Percentage of a country's population classified as obese",
  "Internet Usage (%)": "Percent of people in the region that use the internet",
  "Democracy Index":
    "Measures how democratic a country is based on its elections, government functioning, political freedoms, and civil liberties",
  "Average IQ": "Average of all reported IQ scores",
  "2024 GDP per capita": "Economic output for each person in the country",
};

export function SpiderRadarChart({
  csvUrl = "/spiderplot.csv",
  countries = DEFAULT_COUNTRIES,
  maxCountries = DEFAULT_MAX_COUNTRIES,
  title = "Country Comparison",
  description = "Compare 6 country characteristics (Education spending, Obesity Rate, Internet Usage, Democracy Index, Average IQ, GDP per Capita) to better understand fundamental country systems.",
}: SpiderRadarChartProps) {
  const [mounted, setMounted] = useState(false);
  const [statColumns, setStatColumns] = useState<string[]>([]);
  const [dataByCountry, setDataByCountry] = useState<
    Record<string, Record<string, number | null>>
  >({});
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const prevSelectedRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure component only renders on client to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load CSV on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(csvUrl);
        if (!res.ok) {
          throw new Error(`Failed to load CSV from ${csvUrl}`);
        }
        const text = await res.text();
        const { headers, rows } = parseCsv(text);

        const stats = headers.filter(
          (h) => h !== "Country Name" && h !== "Country Code"
        );

        const byCountry: Record<string, Record<string, number | null>> = {};

        rows.forEach((row) => {
          const name = row["Country Name"];
          if (!name || name.trim() === "") return;

          // Only process countries that are in the countries prop list
          if (!countries.includes(name)) return;

          byCountry[name] = {};
          stats.forEach((col) => {
            const val = row[col];
            const num = val === undefined || val === "" ? null : Number(val);
            byCountry[name][col] = Number.isNaN(num) ? null : num;
          });
        });

        setStatColumns(stats);
        setDataByCountry(byCountry);
      } catch (e) {
        console.error(e);
        setError(
          `Error loading data from ${csvUrl}. Check the console and file location.`
        );
      }
    }

    loadData();
  }, [csvUrl, countries]);

  // Initialize / update Chart.js radar chart when data or selection changes
  useEffect(() => {
    // Only initialize on client side after mount
    if (!mounted) {
      return;
    }
    // Need canvas and stat columns to proceed
    if (!chartRef.current || !statColumns.length) {
      return;
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Create chart if it doesn't exist (show empty grid even before selecting countries)
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Chart(ctx, {
        type: "radar",
        data: {
          labels: statColumns,
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "#fcfcfc",
                font: {
                  size: 18,
                  family: '"Patrick Hand", "Comic Sans MS", cursive',
                },
                padding: 15,
                usePointStyle: true,
              },
            },
            tooltip: {
              titleFont: {
                size: 16,
                family: '"Patrick Hand", "Comic Sans MS", cursive',
              },
              bodyFont: {
                size: 16,
                family: '"Patrick Hand", "Comic Sans MS", cursive',
              },
              callbacks: {
                label(context: {
                  parsed: { r: number };
                  dataset: { label?: string };
                }) {
                  const value = context.parsed.r;
                  return `${context.dataset.label}: ${value.toFixed(
                    1
                  )}th percentile`;
                },
              },
            },
          },
          scales: {
            r: {
              suggestedMin: 0,
              suggestedMax: 100,
              grid: { color: "rgba(255, 255, 255, 0.2)" },
              angleLines: { color: "rgba(255, 255, 255, 0.4)" },
              pointLabels: {
                color: "#ffffff",
                font: {
                  size: 18,
                  family: '"Patrick Hand", "Comic Sans MS", cursive',
                },
              },
              ticks: {
                color: "#ffffff",
                font: {
                  size: 16,
                  family: '"Patrick Hand", "Comic Sans MS", cursive',
                },
                showLabelBackdrop: false,
                backdropColor: "rgba(0,0,0,0)",
                stepSize: 20,
                callback(value: number | string) {
                  return typeof value === "number"
                    ? value.toFixed(0) + "th"
                    : value + "th";
                },
              },
            },
          },
        },
      });
    }

    // If no countries selected, show empty chart with labels
    if (selectedCountries.length === 0) {
      chartInstanceRef.current.data.labels = statColumns;
      chartInstanceRef.current.data.datasets = [];
      chartInstanceRef.current.update("none");
      prevSelectedRef.current = [];
      return;
    }

    const palette = [
      "rgba(129, 212, 250, 0.8)", // chalk-blue
      "rgba(255, 235, 59, 0.8)", // chalk-yellow
      "rgba(239, 154, 154, 0.8)", // chalk-red
    ];

    const bgPalette = [
      "rgba(129, 212, 250, 0.3)", // chalk-blue - transparent fill
      "rgba(255, 235, 59, 0.3)", // chalk-yellow - transparent fill
      "rgba(239, 154, 154, 0.3)", // chalk-red - transparent fill
    ];

    // Build full data for each selected country
    const fullDataByCountry: Record<string, number[]> = {};
    selectedCountries.forEach((name) => {
      const stats = dataByCountry[name];
      if (!stats) return;
      fullDataByCountry[name] = statColumns.map((col) => {
        const val = stats[col];
        return val !== null && val !== undefined ? val : 0;
      });
    });

    const chart = chartInstanceRef.current;
    if (!chart) return;

    // Cancel any in-flight manual animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Keep labels in sync
    chart.data.labels = statColumns;

    const prevSelected = prevSelectedRef.current;

    // Remove datasets for countries that are no longer selected
    chart.data.datasets = chart.data.datasets.filter(
      (ds) => ds.label && selectedCountries.includes(ds.label)
    );

    // Update existing datasets with latest values and colors
    chart.data.datasets.forEach((ds) => {
      const name = ds.label;
      if (!name) return;
      const data = fullDataByCountry[name];
      if (!data) return;
      const idx = selectedCountries.indexOf(name);
      const color = palette[idx % palette.length];
      const bgColor = bgPalette[idx % bgPalette.length];

      ds.data = data;
      ds.borderColor = color;
      ds.backgroundColor = bgColor;
      // @ts-expect-error - pointBackgroundColor is valid for radar charts
      ds.pointBackgroundColor = color;
    });

    // Find newly selected countries
    const newCountries = selectedCountries.filter(
      (name) => !prevSelected.includes(name) && dataByCountry[name]
    );

    // Add datasets for new countries starting at 0 (will animate out)
    newCountries.forEach((name) => {
      const fullData = fullDataByCountry[name];
      if (!fullData) return;
      const idx = selectedCountries.indexOf(name);
      const color = palette[idx % palette.length];
      const bgColor = bgPalette[idx % bgPalette.length];

      const newDataset = {
        label: name,
        data: fullData.map(() => 0),
        borderColor: color,
        backgroundColor: bgColor,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      };
      // @ts-expect-error - pointBackgroundColor is valid for radar charts
      newDataset.pointBackgroundColor = color;
      chart.data.datasets.push(newDataset);
    });

    chart.update();

    // Manually animate only the newly added countries from 0 -> full values
    if (newCountries.length > 0) {
      const duration = 1000;
      const start = performance.now();
      const animate = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        newCountries.forEach((name) => {
          const fullData = fullDataByCountry[name];
          const ds = chart.data.datasets.find((d) => d.label === name);
          if (!ds || !fullData) return;
          ds.data = fullData.map((v) => v * t);
        });
        chart.update();
        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    prevSelectedRef.current = [...selectedCountries];

    return () => {
      // Optional cleanup when component unmounts
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [mounted, statColumns, dataByCountry, selectedCountries]);

  // Handle mouse move to detect label hover
  useEffect(() => {
    if (!mounted) {
      return;
    }
    const canvas = chartRef.current;
    if (!canvas || !chartInstanceRef.current || statColumns.length === 0)
      return;

    const handleMouseMove = (e: MouseEvent) => {
      const chart = chartInstanceRef.current;
      if (!chart) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Get chart center and radius
      const chartArea = chart.chartArea;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      const radius =
        Math.min(
          (chartArea.right - chartArea.left) / 2,
          (chartArea.bottom - chartArea.top) / 2
        ) * 0.9; // Labels are at ~90% of radius

      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if mouse is near the outer edge where labels are
      const labelRadius = radius * 1.15; // Labels are slightly outside the chart
      const distanceTolerance = 30; // Pixel tolerance for distance from label radius
      const angleTolerance = Math.PI / (statColumns.length * 2); // Half the angle between labels

      // Check if mouse is at the right distance
      if (Math.abs(distance - labelRadius) < distanceTolerance) {
        // Calculate angle to determine which label
        const angle = Math.atan2(dy, dx);
        const normalizedAngle =
          (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
        const anglePerLabel = (2 * Math.PI) / statColumns.length;

        // Find the closest label by checking each label's center angle
        let closestLabelIndex = -1;
        let minAngleDiff = Infinity;

        for (let i = 0; i < statColumns.length; i++) {
          const labelCenterAngle = i * anglePerLabel;
          let angleDiff = Math.abs(normalizedAngle - labelCenterAngle);
          // Handle wrap-around
          angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

          if (angleDiff < minAngleDiff && angleDiff < angleTolerance) {
            minAngleDiff = angleDiff;
            closestLabelIndex = i;
          }
        }

        if (closestLabelIndex >= 0 && closestLabelIndex < statColumns.length) {
          const label = statColumns[closestLabelIndex];
          setHoveredLabel(label);
          const rect = canvas.getBoundingClientRect();
          setTooltipPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        } else {
          setHoveredLabel(null);
        }
      } else {
        setHoveredLabel(null);
      }
    };

    const handleMouseLeave = () => {
      setHoveredLabel(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mounted, statColumns]);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  function handleCountryToggle(country: string) {
    setSelectedCountries((current) => {
      const isSelected = current.includes(country);
      if (isSelected) {
        return current.filter((c) => c !== country);
      }
      if (current.length >= maxCountries) {
        return current;
      }
      return [...current, country];
    });
  }

  // Get available countries from loaded data, sorted alphabetically
  const availableCountries = countries
    .filter(
      (country) =>
        dataByCountry[country] && Object.keys(dataByCountry[country]).length > 0
    )
    .sort();

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center text-chalk-red">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col p-4 relative pointer-events-auto overflow-y-auto font-patrick"
    >
      {/* Header */}
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

      {!statColumns.length ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-chalk-white/50 italic">
            Loading data from {csvUrl}...
          </p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Left: Country Selection */}
          <div className="w-72 flex-shrink-0 flex flex-col">
            <h3 className="text-sm font-semibold text-chalk-white mb-2">
              Filter Countries ({maxCountries} max)
            </h3>

            <div className="flex flex-col gap-2">
              {availableCountries.length === 0 ? (
                <p className="text-chalk-white/50 italic">
                  No countries available. Check CSV data.
                </p>
              ) : (
                availableCountries.map((country) => {
                  const isSelected = selectedCountries.includes(country);
                  const isDisabled =
                    !isSelected && selectedCountries.length >= maxCountries;
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
                        w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold text-left
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

          {/* Right: Chart Display */}
          <div
            className="flex-1 relative flex flex-col"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            <div className="relative" style={{ height: "600px" }}>
              {mounted && <canvas ref={chartRef} className="w-full h-full" />}
              {/* Placeholder text when no countries selected */}
              {selectedCountries.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-chalk-white/30 text-lg italic">
                    Select countries to see the radar chart
                  </p>
                </div>
              )}
              {/* Tooltip for label definitions */}
              {hoveredLabel && LABEL_DEFINITIONS[hoveredLabel] && (
                <div
                  className="absolute z-50 bg-black/90 border-2 border-chalk-white/40 rounded-lg p-3 shadow-lg pointer-events-none max-w-xs"
                  style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <p className="text-chalk-white font-bold text-sm mb-1">
                    {hoveredLabel}
                  </p>
                  <p className="text-chalk-white/80 text-xs">
                    {LABEL_DEFINITIONS[hoveredLabel]}
                  </p>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="mt-2 text-center text-xs text-chalk-white/40">
              Data from {csvUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
