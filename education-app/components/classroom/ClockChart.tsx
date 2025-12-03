"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Clock from "@/components/Clock";
import { ClockData } from "@/lib/types";

interface ClockChartProps {
  data: ClockData[];
  title?: string;
  description?: string;
}

const MAX_COUNTRIES = 3;

export function ClockChart({
  data,
  title = "School Day Schedules by Country",
  description = "Select up to 3 countries to compare their school day schedules.",
}: ClockChartProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Get available countries from data, sorted alphabetically
  const availableCountries = Array.from(new Set(data.map((d) => d.country))).sort();

  function handleCountryToggle(country: string) {
    setSelectedCountries((current) => {
      const isSelected = current.includes(country);
      if (isSelected) {
        return current.filter((c) => c !== country);
      }
      if (current.length >= MAX_COUNTRIES) {
        return current;
      }
      return [...current, country];
    });
  }

  // Get clock data for selected countries
  const selectedClockData = data.filter((d) =>
    selectedCountries.includes(d.country)
  );

  return (
    <div className="w-full h-full flex flex-col p-6 relative pointer-events-auto overflow-y-auto">
      {title && (
        <div className="mb-4 border-b-2 border-white/20 pb-3">
          <h2 className="text-2xl text-chalk-white font-bold mb-1">{title}</h2>
        </div>
      )}
      {description && (
        <p className="text-base text-chalk-white/70 italic mb-4 text-center">
          {description}
        </p>
      )}

      {/* Country Selection Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {availableCountries.length === 0 ? (
          <p className="text-chalk-white/50 italic">No countries available.</p>
        ) : (
          availableCountries.map((country) => {
            const isSelected = selectedCountries.includes(country);
            const isDisabled =
              !isSelected && selectedCountries.length >= MAX_COUNTRIES;
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

      {/* Clock Display */}
      <AnimatePresence mode="wait">
        {selectedClockData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex-1 min-h-[400px] relative"
          >
            <div className="h-full flex flex-col items-center justify-center">
              <div
                className={`grid gap-8 justify-items-center ${
                  selectedClockData.length === 1
                    ? "grid-cols-1"
                    : selectedClockData.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                }`}
              >
                {selectedClockData.map((countryData) => (
                  <motion.div
                    key={countryData.country}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <Clock
                      startTime={countryData.startTime}
                      endTime={countryData.endTime}
                      cramSchoolStartTime={countryData.cramSchoolStartTime}
                      cramSchoolEndTime={countryData.cramSchoolEndTime}
                      title={countryData.country}
                      size={280}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <p className="text-chalk-white/50 italic text-center py-8">
              Select up to {MAX_COUNTRIES} countries to compare their school day
              schedules.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Note */}
      <div className="mt-4 text-center text-xs text-chalk-white/40">
        Note: This is a 24-hour clock
      </div>
    </div>
  );
}
