"use client";

import { useState } from "react";
import Clock from "@/components/Clock";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

// Placeholder data - replace with actual values
// startTime and endTime are arrays of hours (0-24, e.g., [8] for single session, [7, 13] for two sessions)
// For Cambodia: [7, 13] means 7-12 and 1-5 (13-17 in 24-hour format)
// cramSchoolStartTime and cramSchoolEndTime are optional - omit if not applicable
const COUNTRY_DATA = [
  {
    country: "USA",
    startTime: [8],
    endTime: [15],
  },
  {
    country: "Finland",
    startTime: [8],
    endTime: [15],
  },
  {
    country: "Cambodia",
    startTime: [7, 13], // 7-12 and 1-5 (13-17)
    endTime: [12, 17],
    cramSchoolStartTime: 17.5,
    cramSchoolEndTime: 19,
  },
  {
    country: "Singapore",
    startTime: [7.5],
    endTime: [14],
    cramSchoolStartTime: 16,
    cramSchoolEndTime: 19,
  },
  {
    country: "Japan",
    startTime: [8.75],
    endTime: [15.25],
    cramSchoolStartTime: 16,
    cramSchoolEndTime: 19,
  },
  {
    country: "Brazil",
    startTime: [7],
    endTime: [12],
  },
];

export default function ClockPage() {
  // Initialize with all countries selected
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(
    new Set(COUNTRY_DATA.map((c) => c.country))
  );

  const handleCountryToggle = (country: string) => {
    setSelectedCountries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return newSet;
    });
  };

  const filteredData = COUNTRY_DATA.filter(({ country }) =>
    selectedCountries.has(country)
  );

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
          Average School Day Length by Country
        </h1>

        {/* Filter Section */}
        <div className="mb-8 p-4 bg-black/30 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-chalk-white mb-3 text-center">
            Select Countries to Display
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COUNTRY_DATA.map(({ country }) => (
              <label
                key={country}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border-2 transition-colors hover:bg-white/10"
                style={{
                  borderColor: selectedCountries.has(country)
                    ? "#81d4fa"
                    : "rgba(255, 255, 255, 0.3)",
                  backgroundColor: selectedCountries.has(country)
                    ? "rgba(129, 212, 250, 0.2)"
                    : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.has(country)}
                  onChange={() => handleCountryToggle(country)}
                  className="w-4 h-4 cursor-pointer accent-chalk-blue"
                />
                <span className="text-chalk-white text-sm font-medium">
                  {country}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                setSelectedCountries(
                  new Set(COUNTRY_DATA.map((c) => c.country))
                );
              }}
              className="text-xs text-chalk-blue hover:underline mr-4"
            >
              Select All
            </button>
            <button
              onClick={() => {
                setSelectedCountries(new Set());
              }}
              className="text-xs text-chalk-blue hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Clocks Grid */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {filteredData.map(
              ({
                country,
                startTime,
                endTime,
                cramSchoolStartTime,
                cramSchoolEndTime,
              }) => {
                return (
                  <div
                    key={country}
                    className="flex flex-col items-center justify-center"
                  >
                    <Clock
                      startTime={startTime}
                      endTime={endTime}
                      cramSchoolStartTime={cramSchoolStartTime}
                      cramSchoolEndTime={cramSchoolEndTime}
                      title={country}
                      size={350}
                    />
                    {/* Time controls */}
                    {/* <div className="mt-4 w-full max-w-[280px] space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-chalk-white/70 w-20">
                        Start:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={times.startTime}
                        onChange={(e) =>
                          handleTimeChange(
                            country,
                            "startTime",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 px-2 py-1 bg-black/30 border border-white/20 rounded text-chalk-white text-sm focus:outline-none focus:border-chalk-blue"
                      />
                      <span className="text-xs text-chalk-white/60 w-8">
                        hrs
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-chalk-white/70 w-20">
                        End:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={times.endTime}
                        onChange={(e) =>
                          handleTimeChange(
                            country,
                            "endTime",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 px-2 py-1 bg-black/30 border border-white/20 rounded text-chalk-white text-sm focus:outline-none focus:border-chalk-blue"
                      />
                      <span className="text-xs text-chalk-white/60 w-8">
                        hrs
                      </span>
                    </div>
                  </div> */}
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-chalk-white/60">
            <p>
              No countries selected. Please select at least one country to
              display.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-chalk-white/80">
          <p className="text-sm">
            This visualization shows the average school day length as a portion
            of a 24-hour day. The blue section represents school hours, while
            the dark section represents the rest of the day. Adjust the start
            and end times for each country to see how school schedules vary.
          </p>
          <p className="text-xs mt-2 text-chalk-white/60">
            Note: Values shown are placeholders. Replace with actual data. Times
            are in 24-hour format (e.g., 8 = 8:00 AM, 15 = 3:00 PM).
          </p>
        </div>
      </div>
    </main>
  );
}
