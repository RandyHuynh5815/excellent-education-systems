'use client';

import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCountries: string[];
  onCountryChange: (country: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  // Histogram-specific filters
  showHistogramFilters?: boolean;
  selectedMetrics?: string[];
  onMetricToggle?: (metric: string) => void;
  histogramSortBy?: string;
  onHistogramSortByChange?: (sortBy: string) => void;
  histogramSortOrder?: 'asc' | 'desc';
  onHistogramSortOrderChange?: (order: 'asc' | 'desc') => void;
}

const COUNTRIES = ['Finland', 'USA', 'Japan', 'Korea', 'Brazil', 'Singapore', 'Cambodia', 'Canada', 'France', 'Italy', 'UK', 'Jordan'];
const SUBJECTS = ['Math', 'Reading', 'Science', 'General'];
const HISTOGRAM_METRICS = ['BELONG', 'BULLIED', 'FEELSAFE'];

const histogramColors = {
  BELONG: "#81d4fa", // chalk-blue
  BULLIED: "#ef9a9a", // chalk-red
  FEELSAFE: "#fff59d", // chalk-yellow
};

export function FilterPanel({ 
  isOpen, 
  onToggle, 
  selectedCountries, 
  onCountryChange,
  selectedSubject,
  onSubjectChange,
  showHistogramFilters = false,
  selectedMetrics = [],
  onMetricToggle,
  histogramSortBy = 'none',
  onHistogramSortByChange,
  histogramSortOrder = 'asc',
  onHistogramSortOrderChange
}: FilterPanelProps) {
  return (
    <>
      <div 
        className={`
          fixed right-0 top-0 h-full w-80 bg-[#1a261d] border-l-4 border-wood-frame 
          shadow-2xl transform transition-transform duration-300 z-40 p-6 overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl text-chalk-white underline decoration-wavy decoration-chalk-yellow">Filters</h2>
          <button onClick={onToggle} className="text-chalk-white hover:text-chalk-red">
            <X size={32} />
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-xl text-chalk-blue mb-4">Subject</h3>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(subject => (
              <button
                key={subject}
                onClick={() => onSubjectChange(subject)}
                className={`
                  px-3 py-1 rounded border-2 transition-colors
                  ${selectedSubject === subject 
                    ? 'bg-chalk-blue text-black border-chalk-blue' 
                    : 'bg-transparent text-chalk-white border-chalk-white/30 hover:border-chalk-blue'}
                `}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl text-chalk-yellow mb-4">Countries</h3>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(country => (
              <button
                key={country}
                onClick={() => onCountryChange(country)}
                className={`
                  px-3 py-1 rounded border-2 transition-colors text-sm
                  ${selectedCountries.includes(country)
                    ? 'bg-chalk-yellow text-black border-chalk-yellow' 
                    : 'bg-transparent text-chalk-white border-chalk-white/30 hover:border-chalk-yellow'}
                `}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Histogram-specific filters */}
        {showHistogramFilters && (
          <>
            <div className="mb-8 border-t border-white/20 pt-6">
              <h3 className="text-xl text-chalk-blue mb-4">Metrics</h3>
              <div className="flex flex-wrap gap-2">
                {HISTOGRAM_METRICS.map(metric => (
                  <button
                    key={metric}
                    onClick={() => onMetricToggle?.(metric)}
                    className={`
                      px-3 py-1 rounded border-2 transition-colors text-sm
                      ${selectedMetrics.includes(metric)
                        ? 'text-black border-current' 
                        : 'bg-transparent text-chalk-white border-chalk-white/30 hover:border-current'}
                    `}
                    style={{
                      borderColor: selectedMetrics.includes(metric)
                        ? histogramColors[metric as keyof typeof histogramColors]
                        : undefined,
                      backgroundColor: selectedMetrics.includes(metric)
                        ? `${histogramColors[metric as keyof typeof histogramColors]}`
                        : undefined,
                    }}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 border-t border-white/20 pt-6">
              <h3 className="text-xl text-chalk-red mb-4">Sort</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-chalk-white text-sm mb-2 block">
                    Sort by:
                  </label>
                  <select
                    value={histogramSortBy}
                    onChange={(e) => onHistogramSortByChange?.(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-chalk-white text-sm focus:outline-none focus:border-chalk-blue cursor-pointer"
                  >
                    <option value="none">None</option>
                    {selectedMetrics.includes("BELONG") && (
                      <option value="BELONG">BELONG</option>
                    )}
                    {selectedMetrics.includes("BULLIED") && (
                      <option value="BULLIED">BULLIED</option>
                    )}
                    {selectedMetrics.includes("FEELSAFE") && (
                      <option value="FEELSAFE">FEELSAFE</option>
                    )}
                  </select>
                </div>
                {histogramSortBy !== 'none' && (
                  <div>
                    <label className="text-chalk-white text-sm mb-2 block">
                      Order:
                    </label>
                    <select
                      value={histogramSortOrder}
                      onChange={(e) => onHistogramSortOrderChange?.(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-chalk-white text-sm focus:outline-none focus:border-chalk-blue cursor-pointer"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {!isOpen && (
        <button 
          onClick={onToggle}
          className="absolute right-8 top-8 bg-wood-frame p-3 rounded shadow-lg text-chalk-white hover:scale-110 transition-transform z-30"
          title="Open Filters"
        >
          <Filter size={24} />
        </button>
      )}
    </>
  );
}

