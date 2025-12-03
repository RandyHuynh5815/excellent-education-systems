'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_MAX_COUNTRIES = 3;

// Default country list used in your project; can be overridden via props
const DEFAULT_COUNTRIES = [
  'Brazil',
  'Cambodia',
  'Finland',
  'Japan',
  'Singapore',
  'United States',
];

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  
  // Parse CSV line handling quoted fields
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
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
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
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
      obj[h] = cols[i] || '';
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

export function SpiderRadarChart({
  csvUrl = '/spiderplot.csv',
  countries = DEFAULT_COUNTRIES,
  maxCountries = DEFAULT_MAX_COUNTRIES,
  title = 'Country Comparison Radar Chart',
  description = 'Select up to 3 countries to compare their percentile scores across multiple dimensions.',
}: SpiderRadarChartProps) {
  const [statColumns, setStatColumns] = useState<string[]>([]);
  const [dataByCountry, setDataByCountry] = useState<Record<string, Record<string, number | null>>>({});
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [error, setError] = useState('');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const prevSelectedRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);

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
          (h) => h !== 'Country Name' && h !== 'Country Code'
        );

        const byCountry: Record<string, Record<string, number | null>> = {};
        
        rows.forEach((row) => {
          const name = row['Country Name'];
          if (!name || name.trim() === '') return;

          // Only process countries that are in the countries prop list
          if (!countries.includes(name)) return;

          byCountry[name] = {};
          stats.forEach((col) => {
            const val = row[col];
            const num = val === undefined || val === '' ? null : Number(val);
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
    // Destroy chart if no countries selected or canvas is gone
    if (selectedCountries.length === 0 || !chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
        prevSelectedRef.current = [];
      }
      return;
    }

    if (!statColumns.length) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const palette = [
      'rgba(129, 212, 250, 0.8)', // chalk-blue
      'rgba(255, 235, 59, 0.8)',  // chalk-yellow
      'rgba(239, 154, 154, 0.8)', // chalk-red
    ];
    
    const bgPalette = [
      'rgba(129, 212, 250, 0.3)', // chalk-blue - transparent fill
      'rgba(255, 235, 59, 0.3)',  // chalk-yellow - transparent fill
      'rgba(239, 154, 154, 0.3)', // chalk-red - transparent fill
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

    // Create chart if it doesn't exist
    // Since AnimatePresence recreates the canvas, we always recreate the chart
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: statColumns,
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false, // manual animation
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#fcfcfc',
                font: {
                  size: 14,
                },
                padding: 15,
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label(context: { parsed: { r: number }; dataset: { label?: string } }) {
                  const value = context.parsed.r;
                  return `${context.dataset.label}: ${value.toFixed(1)}th percentile`;
                },
              },
            },
          },
          scales: {
            r: {
              suggestedMin: 0,
              suggestedMax: 100,
              grid: {
                color: 'rgba(255, 255, 255, 0.2)',
              },
              angleLines: {
                color: 'rgba(255, 255, 255, 0.4)',
              },
              pointLabels: {
                color: '#ffffff',
                font: {
                  size: 11,
                },
              },
              ticks: {
                color: '#ffffff',
                showLabelBackdrop: false,
                backdropColor: 'rgba(0,0,0,0)',
                stepSize: 20,
                callback(value: number | string) {
                  return typeof value === 'number' ? value.toFixed(0) + 'th' : value + 'th';
                },
              },
            },
          },
        },
      });
    }

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
    chart.data.datasets = chart.data.datasets.filter((ds) =>
      ds.label && selectedCountries.includes(ds.label)
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
  }, [statColumns, dataByCountry, selectedCountries]);

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

  // Get available countries from loaded data
  const availableCountries = countries.filter(country => 
    dataByCountry[country] && Object.keys(dataByCountry[country]).length > 0
  );

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center text-chalk-red">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 relative pointer-events-auto overflow-y-auto">
      {title && (
        <div className="mb-4 border-b-2 border-white/20 pb-3">
          <h2 className="text-2xl text-chalk-white font-bold mb-1">
            {title}
          </h2>
        </div>
      )}
      {description && (
        <p className="text-base text-chalk-white/70 italic mb-4 text-center">
          {description}
        </p>
      )}

      {!statColumns.length ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-chalk-white/50 italic">
            Loading data from {csvUrl}...
          </p>
        </div>
      ) : (
        <>
          {/* Country Selection Buttons on Chalkboard */}
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {availableCountries.length === 0 ? (
              <p className="text-chalk-white/50 italic">No countries available. Check CSV data.</p>
            ) : (
              availableCountries.map((country) => {
                const isSelected = selectedCountries.includes(country);
                const isDisabled = !isSelected && selectedCountries.length >= maxCountries;
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
                      ${isSelected
                        ? 'bg-chalk-yellow text-black border-chalk-yellow shadow-lg'
                        : isDisabled
                        ? 'bg-transparent text-chalk-white/30 border-chalk-white/20 cursor-not-allowed'
                        : 'bg-transparent text-chalk-white border-chalk-white/40 hover:border-chalk-blue hover:text-chalk-blue hover:bg-white/5 cursor-pointer'}
                    `}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    style={{ pointerEvents: isDisabled ? 'none' : 'auto' }}
                  >
                    {country}
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Selected Countries Display */}
          {selectedCountries.length > 0 && (
            <div className="mb-4 text-center">
              <p className="text-chalk-white/80 text-sm mb-2">
                Selected: {selectedCountries.join(', ')}
              </p>
              <p className="text-chalk-white/50 text-xs">
                {selectedCountries.length < maxCountries 
                  ? `Select up to ${maxCountries - selectedCountries.length} more`
                  : 'Maximum countries selected'}
              </p>
            </div>
          )}

          {/* Inline Chart Display */}
          <AnimatePresence mode="wait">
            {selectedCountries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-4 flex-1 min-h-[400px] relative"
              >
                <div className="h-full flex flex-col">
                  {/* Chart Container */}
                  <div className="flex-1 min-h-[400px] relative">
                    <canvas ref={chartRef} className="w-full h-full" />
                  </div>

                  {/* Footer */}
                  <div className="mt-3 text-center text-xs text-chalk-white/40">
                    Data from {csvUrl}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
