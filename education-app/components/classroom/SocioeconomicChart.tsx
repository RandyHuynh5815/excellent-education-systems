"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Cell,
} from "recharts";
import { SocioeconomicData } from "@/lib/types";
import Image from "next/image";

interface SocioeconomicChartProps {
  data: SocioeconomicData[];
  title?: string;
  description?: string;
}

// Positions on a 100x50 viewBox world map
const COUNTRY_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  "Brazil": { x: 25, y: 35, label: "Brazil" },
  "Cambodia": { x: 78, y: 24, label: "Cambodia" },
  "Finland": { x: 52, y: 7, label: "Finland" },
  "Japan": { x: 90, y: 14, label: "Japan" },
  "Singapore": { x: 78, y: 29, label: "Singapore" },
  "United States": { x: 15, y: 14, label: "USA" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  "Brazil": "/flags/brazil.png",
  "Cambodia": "/flags/cambodia.png",
  "Finland": "/flags/finland.png",
  "Japan": "/flags/japan.png",
  "Singapore": "/flags/singapore.png",
  "United States": "/flags/united-states.png",
};

const COUNTRY_COLORS: Record<string, string> = {
  "Brazil": "#22c55e",
  "Cambodia": "#ef4444",
  "Finland": "#3b82f6",
  "Japan": "#f43f5e",
  "Singapore": "#ec4899",
  "United States": "#6366f1",
};

const METRIC_INFO: Record<string, { label: string; description: string; unit: string }> = {
  ESCS: {
    label: "ESCS",
    description: "Economic, Social and Cultural Status index",
    unit: "index",
  },
  HISCED: {
    label: "HISCED",
    description: "Highest level of parental education (0-8 scale)",
    unit: "level",
  },
  HISEI: {
    label: "HISEI",
    description: "Highest parental occupational status",
    unit: "score",
  },
};

// Real world map continent paths (scaled to 100x50 viewBox)
const CONTINENT_PATHS = {
  // North America
  northAmerica: "M5,12 L7,8 L10,6 L12,4 L15,3 L18,4 L20,3 L23,4 L25,6 L24,8 L22,7 L20,8 L18,10 L20,12 L22,14 L24,13 L26,14 L25,16 L23,18 L21,20 L19,22 L17,24 L15,23 L13,21 L11,19 L10,17 L8,16 L6,14 L5,12 Z",
  // Greenland
  greenland: "M28,4 L32,3 L35,4 L36,7 L34,10 L31,11 L28,9 L27,6 L28,4 Z",
  // South America  
  southAmerica: "M20,26 L22,25 L25,26 L27,28 L29,31 L30,35 L29,39 L27,43 L24,46 L21,47 L19,45 L18,41 L19,37 L18,33 L19,29 L20,26 Z",
  // Europe
  europe: "M45,8 L48,6 L52,7 L54,9 L53,11 L50,12 L47,14 L44,13 L43,10 L45,8 Z M55,6 L58,5 L60,7 L58,9 L55,8 L55,6 Z",
  // Africa
  africa: "M43,18 L47,16 L51,17 L54,19 L56,22 L57,26 L56,30 L54,34 L51,37 L47,39 L43,38 L40,35 L39,31 L40,27 L41,23 L43,18 Z",
  // Asia
  asia: "M58,5 L62,4 L68,3 L74,4 L80,6 L86,8 L90,11 L92,15 L91,19 L88,22 L84,24 L79,25 L74,26 L69,25 L65,23 L62,20 L60,17 L58,14 L56,11 L57,8 L58,5 Z M92,12 L96,10 L98,13 L96,16 L93,15 L92,12 Z",
  // Southeast Asia / Indonesia
  seAsia: "M75,27 L78,26 L82,27 L85,29 L84,32 L80,33 L76,32 L75,29 L75,27 Z M86,30 L89,29 L91,31 L89,33 L86,32 L86,30 Z",
  // Australia
  australia: "M80,36 L85,34 L90,35 L94,38 L93,42 L89,45 L84,46 L80,44 L79,40 L80,36 Z",
  // New Zealand
  newZealand: "M96,42 L98,41 L99,44 L97,46 L95,45 L96,42 Z",
};

export function SocioeconomicChart({
  data,
  title = "Socioeconomic Origins Comparison",
  description = "Compare socioeconomic origins and parental educational/economic status across countries.",
}: SocioeconomicChartProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<"ESCS" | "HISCED" | "HISEI">("ESCS");

  const availableCountries = data.map((d) => d.country);

  function handleCountryToggle(country: string) {
    setSelectedCountries((current) => {
      const isSelected = current.includes(country);
      if (isSelected) {
        return current.filter((c) => c !== country);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, country];
    });
  }

  // Prepare comparison bar chart data
  const comparisonData = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    return selectedCountries.map((country) => {
      const countryData = data.find((d) => d.country === country);
      return {
        country: country === "United States" ? "USA" : country,
        ESCS: countryData?.ESCS ?? 0,
        HISCED: countryData?.HISCED ?? 0,
        HISEI: countryData?.HISEI ?? 0,
        fill: COUNTRY_COLORS[country],
      };
    });
  }, [selectedCountries, data]);

  // Prepare histogram data for the selected metric
  const histogramData = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    
    // Combine distributions from all selected countries
    const allBins: Record<string, Record<string, number>> = {};
    
    selectedCountries.forEach((country) => {
      const countryData = data.find((d) => d.country === country);
      if (countryData?.escsDistribution) {
        countryData.escsDistribution.forEach((bin) => {
          const binKey = `${bin.binStart.toFixed(2)}`;
          if (!allBins[binKey]) {
            allBins[binKey] = { binStart: bin.binStart, binEnd: bin.binEnd };
          }
          allBins[binKey][country] = bin.count;
        });
      }
    });
    
    return Object.values(allBins).sort((a, b) => (a.binStart as number) - (b.binStart as number));
  }, [selectedCountries, data]);

  // Get selected country data
  const selectedCountryData = useMemo(() => {
    return selectedCountries.map((country) => data.find((d) => d.country === country)).filter(Boolean);
  }, [selectedCountries, data]);

  return (
    <div className="w-full h-full flex flex-col p-4 relative pointer-events-auto overflow-y-auto">
      {/* Header */}
      {title && (
        <div className="mb-3 border-b-2 border-white/20 pb-2">
          <h2 className="text-2xl text-chalk-white font-bold mb-1">{title}</h2>
          {description && (
            <p className="text-sm text-chalk-white/70 italic">{description}</p>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Mini World Map */}
        <div className="w-72 flex-shrink-0 flex flex-col">
          <h3 className="text-sm font-semibold text-chalk-white mb-2">Select Countries (max 3)</h3>
          
          {/* Mini Map */}
          <div className="relative bg-[#2541b2] rounded-xl p-2 h-44 border-2 border-chalk-white/20 overflow-hidden shadow-lg">
            {/* Ocean background */}
            <div className="absolute inset-0 bg-[#1e3a8a]" />
            
            <svg
              viewBox="0 0 100 50"
              className="w-full h-full relative z-10"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Continent shapes */}
              {Object.entries(CONTINENT_PATHS).map(([name, path]) => (
                <path
                  key={name}
                  d={path}
                  fill="#4ade80"
                  stroke="#22c55e"
                  strokeWidth="0.3"
                />
              ))}
              
              {/* Country markers */}
              {availableCountries.map((country) => {
                const pos = COUNTRY_POSITIONS[country];
                if (!pos) return null;
                const isSelected = selectedCountries.includes(country);
                const isHovered = hoveredCountry === country;
                const isDisabled = !isSelected && selectedCountries.length >= 3;
                
                return (
                  <g key={country}>
                    {/* Pulse ring for selected */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="5"
                        fill="none"
                        stroke={COUNTRY_COLORS[country]}
                        strokeWidth="1"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}
                    {/* Main marker */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 3 : isHovered ? 2.5 : 2}
                      fill={isSelected ? COUNTRY_COLORS[country] : isDisabled ? "#555" : "#fff"}
                      stroke={isSelected ? "#fff" : isHovered ? "#fff" : "none"}
                      strokeWidth="0.6"
                      style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                      onClick={() => !isDisabled && handleCountryToggle(country)}
                      onMouseEnter={() => setHoveredCountry(country)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    />
                    {/* Label */}
                    {(isHovered || isSelected) && (
                      <text
                        x={pos.x}
                        y={pos.y - 5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="3.5"
                        fontWeight="bold"
                        style={{ textShadow: "0 0 3px #000, 0 0 5px #000" }}
                      >
                        {pos.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Country Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {availableCountries.map((country) => {
              const isSelected = selectedCountries.includes(country);
              const isDisabled = !isSelected && selectedCountries.length >= 3;
              const flagPath = COUNTRY_FLAGS[country];
              
              return (
                <motion.button
                  key={country}
                  onClick={() => !isDisabled && handleCountryToggle(country)}
                  disabled={isDisabled}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${isSelected
                      ? "shadow-lg"
                      : isDisabled
                      ? "bg-transparent text-chalk-white/30 border-chalk-white/10 cursor-not-allowed"
                      : "bg-black/20 text-chalk-white border-chalk-white/30 hover:border-chalk-white/60 hover:bg-white/10"
                    }
                  `}
                  style={{
                    borderColor: isSelected ? COUNTRY_COLORS[country] : undefined,
                    backgroundColor: isSelected ? `${COUNTRY_COLORS[country]}25` : undefined,
                    color: isSelected ? COUNTRY_COLORS[country] : undefined,
                  }}
                  whileHover={!isDisabled ? { scale: 1.03 } : {}}
                  whileTap={!isDisabled ? { scale: 0.97 } : {}}
                >
                  {flagPath && (
                    <Image
                      src={flagPath}
                      alt={country}
                      width={20}
                      height={14}
                      className="rounded object-cover"
                    />
                  )}
                  <span>{country === "United States" ? "USA" : country}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Selected info */}
          {selectedCountries.length > 0 && (
            <div className="mt-2 text-xs text-chalk-white/60 text-center">
              {selectedCountries.length}/3 selected
            </div>
          )}
        </div>

        {/* Right: Charts Area */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <AnimatePresence mode="wait">
            {selectedCountries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center text-chalk-white/50 italic">
                  <p className="text-lg mb-2">Select countries from the map to compare</p>
                  <p className="text-sm">Click on map markers or buttons to select up to 3 countries</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col gap-3 min-h-0"
              >
                {/* Top row: Metric selector + description */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(["ESCS", "HISCED", "HISEI"] as const).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setActiveMetric(metric)}
                        className={`
                          px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                          ${activeMetric === metric
                            ? "bg-chalk-yellow text-black"
                            : "bg-transparent text-chalk-white/70 hover:text-chalk-white hover:bg-white/10 border border-chalk-white/30"
                          }
                        `}
                      >
                        {METRIC_INFO[metric].label}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-chalk-white/60 italic">
                    {METRIC_INFO[activeMetric].description}
                  </div>
                </div>

                {/* Country Comparison Bars */}
                <div className="h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      layout="vertical"
                      margin={{ top: 5, right: 25, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        type="number"
                        tick={{ fill: "#fcfcfc", fontSize: 11 }}
                        domain={activeMetric === "HISEI" ? [0, 100] : activeMetric === "HISCED" ? [0, 8] : [-3, 2]}
                      />
                      <YAxis
                        type="category"
                        dataKey="country"
                        tick={{ fill: "#fcfcfc", fontSize: 12 }}
                        width={48}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.9)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "8px",
                          color: "#fcfcfc",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [value.toFixed(2), METRIC_INFO[activeMetric].label]}
                      />
                      <Bar
                        dataKey={activeMetric}
                        name={METRIC_INFO[activeMetric].label}
                        radius={[0, 6, 6, 0]}
                        animationDuration={600}
                        animationBegin={0}
                      >
                        {comparisonData.map((entry) => (
                          <Cell key={entry.country} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* ESCS Distribution Histogram */}
                <div className="flex-1 min-h-[160px]">
                  <h4 className="text-sm font-semibold text-chalk-white mb-1 text-center">
                    ESCS Distribution (Student Count)
                  </h4>
                  <ResponsiveContainer width="100%" height="95%">
                    <ComposedChart
                      data={histogramData}
                      margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="binStart"
                        tick={{ fill: "#fcfcfc", fontSize: 10 }}
                        tickFormatter={(value) => value.toFixed(1)}
                        label={{
                          value: "ESCS Index",
                          position: "bottom",
                          fill: "#fcfcfc",
                          fontSize: 11,
                          offset: 10,
                        }}
                      />
                      <YAxis
                        tick={{ fill: "#fcfcfc", fontSize: 10 }}
                        width={40}
                        label={{
                          value: "Students",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#fcfcfc",
                          fontSize: 11,
                          offset: 5,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.9)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "8px",
                          color: "#fcfcfc",
                          fontSize: "12px",
                        }}
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(),
                          name === "United States" ? "USA" : name,
                        ]}
                        labelFormatter={(label) => `ESCS: ${Number(label).toFixed(2)}`}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                        formatter={(value) => (value === "United States" ? "USA" : value)}
                      />
                      {selectedCountries.map((country, index) => (
                        <Area
                          key={country}
                          type="monotone"
                          dataKey={country}
                          stroke={COUNTRY_COLORS[country]}
                          fill={COUNTRY_COLORS[country]}
                          fillOpacity={0.3}
                          strokeWidth={2}
                          name={country}
                          animationDuration={500}
                          animationBegin={index * 100}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats Summary */}
                <div className="flex gap-3 justify-center flex-wrap">
                  {selectedCountryData.map((countryData) => (
                    <div
                      key={countryData?.country}
                      className="bg-black/30 rounded-lg px-4 py-2 text-center min-w-[90px]"
                      style={{ borderLeft: `4px solid ${COUNTRY_COLORS[countryData?.country || ""]}` }}
                    >
                      <div className="text-xs text-chalk-white/70 mb-0.5">
                        {countryData?.country === "United States" ? "USA" : countryData?.country}
                      </div>
                      <div className="text-lg font-bold text-chalk-white">
                        {countryData?.[activeMetric]?.toFixed(2) ?? "N/A"}
                      </div>
                      <div className="text-[10px] text-chalk-white/50">
                        {METRIC_INFO[activeMetric].unit}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 text-center text-xs text-chalk-white/40">
        Source: PISA 2022 Student Data
      </div>
    </div>
  );
}


