'use client';

import { useState, useMemo } from 'react';
import { CountryCard } from './CountryCard';
import { COUNTRY_STATS, getRankedCountries, CountryId } from '@/lib/countryReportData';
import { Button } from '@/components/ui/Button';
import { Check, X } from 'lucide-react';

export default function CountryEducationReportCards() {
  const [bestGuess, setBestGuess] = useState<string>("");
  const [lowestGuess, setLowestGuess] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const { best, lowest } = useMemo(() => getRankedCountries(), []);

  const handleSubmit = () => {
    if (bestGuess && lowestGuess && bestGuess !== lowestGuess) {
      setSubmitted(true);
      // Scroll to feedback (simple implementation)
      setTimeout(() => {
        document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const isCorrectBest = bestGuess === best.id;
  const isCorrectLowest = lowestGuess === lowest.id;
  const isAllCorrect = isCorrectBest && isCorrectLowest;

  return (
    <div className="max-w-7xl mx-auto p-8 font-sans text-chalk-white">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-handwriting text-chalk-yellow mb-4">
          Global Education Report Cards
        </h1>
        <p className="text-xl max-w-2xl mx-auto text-chalk-white/80">
          Explore the report cards below. Based on the data, can you guess which country has the 
          <span className="font-bold text-chalk-blue"> strongest</span> and 
          <span className="font-bold text-chalk-red"> weakest</span> overall education profile?
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {COUNTRY_STATS.map(country => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>

      {/* Guessing Section */}
      <div className="bg-black/20 backdrop-blur-sm border-2 border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-handwriting text-center mb-8">
          Your Guess: Who is Best and Lowest?
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-8">
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <label className="font-bold text-chalk-blue">Best Overall System</label>
            <select 
              value={bestGuess}
              onChange={(e) => {
                setBestGuess(e.target.value);
                setSubmitted(false);
              }}
              className="bg-white/10 border border-white/30 rounded p-3 text-chalk-white focus:outline-none focus:border-chalk-blue"
              disabled={submitted}
            >
              <option value="" className="text-black">-- Select Country --</option>
              {COUNTRY_STATS.map(c => (
                <option key={c.id} value={c.id} className="text-black">{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs">
            <label className="font-bold text-chalk-red">Lowest Overall System</label>
            <select 
              value={lowestGuess}
              onChange={(e) => {
                setLowestGuess(e.target.value);
                setSubmitted(false);
              }}
              className="bg-white/10 border border-white/30 rounded p-3 text-chalk-white focus:outline-none focus:border-chalk-red"
              disabled={submitted}
            >
              <option value="" className="text-black">-- Select Country --</option>
              {COUNTRY_STATS.map(c => (
                <option key={c.id} value={c.id} className="text-black">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {bestGuess === lowestGuess && bestGuess !== "" && (
          <p className="text-center text-chalk-red mb-4">
            Please choose different countries for best and lowest.
          </p>
        )}

        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            disabled={!bestGuess || !lowestGuess || bestGuess === lowestGuess || submitted}
            variant="secondary"
            className="text-xl px-12 py-3"
          >
            Submit Guess
          </Button>
        </div>
      </div>

      {/* Feedback Section */}
      {submitted && (
        <div id="feedback-section" className="mt-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className={`
            p-8 rounded-xl border-4 text-center
            ${isAllCorrect ? 'bg-green-900/40 border-green-400' : 'bg-red-900/40 border-red-400'}
          `}>
            <div className="flex justify-center mb-4">
              {isAllCorrect ? <Check size={64} className="text-green-400" /> : <X size={64} className="text-red-400" />}
            </div>
            
            <h3 className="text-3xl font-bold mb-4">
              {isAllCorrect ? "Spot On!" : "Not Quite..."}
            </h3>
            
            <p className="text-xl mb-6">
              {isAllCorrect 
                ? `You correctly identified ${best.name} as the strongest and ${lowest.name} as the weakest based on our data.`
                : `Our composite ranking suggests ${best.name} is the strongest and ${lowest.name} is the weakest.`
              }
            </p>

            <div className="text-sm bg-black/20 p-4 rounded inline-block text-left max-w-2xl">
              <p className="font-bold mb-2">How we calculated this:</p>
              <p>
                We created a "Composite Score" by combining Math Scores, Socioeconomic Status (ESCS), 
                Parental Education, Sense of Belonging, and Safety (positive factors), and subtracting 
                the Bullying Index (negative factor).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

