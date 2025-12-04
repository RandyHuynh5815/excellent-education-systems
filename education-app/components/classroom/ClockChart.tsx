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
  title = "Time Spent in School",
  description = "Compare the amount of time students spend in school, including after school classes. Cram school: After-school program where students receive intensive study, tutoring, or test preparation to improve their academic performance.",
}: ClockChartProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedClock, setSelectedClock] = useState<ClockData | null>(null);

  // Get available countries from data, sorted alphabetically
  const availableCountries = Array.from(
    new Set(data.map((d) => d.country))
  ).sort();

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

  // Calculate details for selected clock
  const calculateClockDetails = (clockData: ClockData) => {
    const schoolSessions = clockData.startTime.map((start, index) => {
      const end = clockData.endTime[index];
      const normalizedStart = start % 24;
      const normalizedEnd = end % 24;
      const sessionHours =
        normalizedEnd > normalizedStart
          ? normalizedEnd - normalizedStart
          : 24 - normalizedStart + normalizedEnd;
      return {
        start: normalizedStart,
        end: normalizedEnd,
        hours: sessionHours,
      };
    });

    const actualSchoolHours = schoolSessions.reduce(
      (sum, session) => sum + session.hours,
      0
    );

    const normalizedCramStartTime =
      clockData.cramSchoolStartTime !== undefined
        ? clockData.cramSchoolStartTime % 24
        : 0;
    const normalizedCramEndTime =
      clockData.cramSchoolEndTime !== undefined
        ? clockData.cramSchoolEndTime % 24
        : 0;

    const actualCramHours =
      clockData.cramSchoolStartTime !== undefined &&
      clockData.cramSchoolEndTime !== undefined
        ? normalizedCramEndTime > normalizedCramStartTime
          ? normalizedCramEndTime - normalizedCramStartTime
          : 24 - normalizedCramStartTime + normalizedCramEndTime
        : 0;

    const totalEducationHours = actualSchoolHours + actualCramHours;
    const percentage = ((totalEducationHours / 24) * 100).toFixed(1);

    return {
      schoolSessions,
      actualSchoolHours,
      actualCramHours,
      totalEducationHours,
      percentage,
      normalizedCramStartTime,
      normalizedCramEndTime,
    };
  };

  const clockDetails = selectedClock
    ? calculateClockDetails(selectedClock)
    : null;

  // If a clock is selected, show enlarged view with details
  if (selectedClock) {
    return (
      <div className="w-full h-full flex flex-col p-6 relative pointer-events-auto overflow-y-auto font-patrick">
        {/* Back Button */}
        <button
          onClick={() => setSelectedClock(null)}
          className="mb-4 px-4 py-2 bg-chalk-yellow text-black rounded-lg border-2 border-chalk-yellow hover:bg-chalk-blue hover:text-white hover:border-chalk-blue transition-all font-semibold self-start"
        >
          ← Back to Clocks
        </button>

        {/* Enlarged Clock View */}
        <div className="flex-1 flex flex-row gap-6 min-h-0">
          {/* Left Side - Enlarged Clock */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Clock
              startTime={selectedClock.startTime}
              endTime={selectedClock.endTime}
              cramSchoolStartTime={selectedClock.cramSchoolStartTime}
              cramSchoolEndTime={selectedClock.cramSchoolEndTime}
              title={selectedClock.country}
              size={400}
            />
          </div>

          {/* Right Side - Details Panel */}
          {clockDetails && (
            <div className="w-80 bg-[#2d3e30]/50 backdrop-blur-sm border-2 border-chalk-white/30 rounded-lg p-6 flex flex-col">
              <h3 className="text-3xl font-bold text-chalk-white mb-4 border-b-2 border-chalk-white/20 pb-2">
                {selectedClock.country}'s Student Schedule
              </h3>

              <div className="flex-1 space-y-4">
                {/* Total Hours */}
                <div className="bg-black/30 rounded-lg p-4 border border-chalk-white/20">
                  <div className="text-chalk-white/70 text-base mb-1">
                    Total Education Hours
                  </div>
                  <div className="text-4xl font-bold text-chalk-yellow">
                    {clockDetails.totalEducationHours.toFixed(1)}h
                  </div>
                  <div className="text-chalk-white/60 text-base mt-1">
                    {clockDetails.percentage}% of day
                  </div>
                </div>

                {/* School Sessions */}
                <div className="bg-black/30 rounded-lg p-4 border border-chalk-white/20">
                  <div className="text-chalk-white/70 text-base mb-2">
                    School Hours
                  </div>
                  <div className="text-2xl font-bold text-chalk-blue mb-2">
                    {clockDetails.actualSchoolHours.toFixed(1)}h
                  </div>
                  <div className="space-y-1">
                    {clockDetails.schoolSessions.map((session, index) => (
                      <div key={index} className="text-chalk-white text-base">
                        {Math.floor(session.start)}:00 -{" "}
                        {Math.floor(session.end)}:00
                        <span className="text-chalk-white/60 ml-2">
                          ({session.hours.toFixed(1)}h)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cram School */}
                {clockDetails.actualCramHours > 0 && (
                  <div className="bg-black/30 rounded-lg p-4 border border-chalk-white/20">
                    <div className="text-chalk-white/70 text-base mb-2">
                      Cram School
                    </div>
                    <div className="text-2xl font-bold text-chalk-yellow mb-2">
                      {clockDetails.actualCramHours.toFixed(1)}h
                    </div>
                    <div className="text-chalk-white text-base">
                      {Math.floor(clockDetails.normalizedCramStartTime)}:00 -{" "}
                      {Math.floor(clockDetails.normalizedCramEndTime)}:00
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 relative pointer-events-auto overflow-y-auto font-patrick">
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

      {/* Country Selection Buttons */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-chalk-white mb-2">
          Filter Countries (3 max) - Click on a clock to learn more about the
          student schedule.
        </h3>
      </div>
      <div className="flex flex-wrap gap-3 justify-start mb-4">
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
                className={`grid justify-items-center items-center ${
                  selectedClockData.length === 1
                    ? "grid-cols-1 gap-0"
                    : selectedClockData.length === 2
                    ? "grid-cols-2 gap-6"
                    : "grid-cols-3 gap-6"
                }`}
                style={{ width: "100%" }}
              >
                {selectedClockData.map((countryData) => (
                  <motion.div
                    key={countryData.country}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setSelectedClock(countryData)}
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
