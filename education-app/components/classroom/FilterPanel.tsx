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
}

const COUNTRIES = ['Finland', 'USA', 'Japan', 'Korea', 'Brazil', 'Singapore', 'Canada', 'France', 'Italy', 'UK', 'Jordan'];
const SUBJECTS = ['Math', 'Reading', 'Science', 'General'];

export function FilterPanel({ 
  isOpen, 
  onToggle, 
  selectedCountries, 
  onCountryChange,
  selectedSubject,
  onSubjectChange
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

