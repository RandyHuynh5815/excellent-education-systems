'use client';

import { useState, useMemo, useEffect } from 'react';
import { CountryCard } from './CountryCard';
import { COUNTRY_STATS, getRankedCountries, CountryId } from '@/lib/countryReportData';
import { Button } from '@/components/ui/Button';
import { Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { OpinionSubmission } from '@/lib/types';

export default function CountryEducationReportCards() {
  const [bestGuess, setBestGuess] = useState<string>("");
  const [lowestGuess, setLowestGuess] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState<OpinionSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { best, lowest } = useMemo(() => getRankedCountries(), []);

  // Fetch all submissions on load
  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/opinions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch votes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (bestGuess && lowestGuess && bestGuess !== lowestGuess) {
      try {
        const res = await fetch('/api/opinions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bestCountry: bestGuess, worstCountry: lowestGuess }),
        });

        if (res.ok) {
          setSubmitted(true);
          await fetchVotes(); // Refresh data
          
          // Scroll to feedback
          setTimeout(() => {
            document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (error) {
        console.error('Failed to submit vote', error);
      }
    }
  };

  const isCorrectBest = bestGuess === best.id;
  const isCorrectLowest = lowestGuess === lowest.id;
  const isAllCorrect = isCorrectBest && isCorrectLowest;

  // Aggregate votes from actual submissions
  const chartData = useMemo(() => {
    const counts: Record<string, { best: number, lowest: number }> = {};
    
    // Initialize
    COUNTRY_STATS.forEach(c => {
      counts[c.id] = { best: 0, lowest: 0 };
    });

    // Tally
    submissions.forEach(sub => {
      if (counts[sub.bestCountry]) counts[sub.bestCountry].best++;
      if (counts[sub.worstCountry]) counts[sub.worstCountry].lowest++;
    });

    return COUNTRY_STATS.map(c => ({
      name: c.name,
      bestVotes: counts[c.id]?.best || 0,
      lowestVotes: counts[c.id]?.lowest || 0,
    }));
  }, [submissions]);

  return (
    <div className="max-w-7xl mx-auto p-8 text-chalk-white" style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive', fontSize: '1.25rem' }}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl text-chalk-yellow mb-4">
          Global Education Report Cards
        </h1>
        <p className="text-2xl max-w-3xl mx-auto text-chalk-white/80">
          Explore the report cards below. Based on the data, which country do you think has the 
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
        <h2 className="text-4xl text-center mb-8">
          Your Opinion: Who is Best and Lowest?
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-8">
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <label className="font-bold text-chalk-blue text-xl">Best Overall System</label>
            <select 
              value={bestGuess}
              onChange={(e) => {
                setBestGuess(e.target.value);
                setSubmitted(false);
              }}
              className="bg-white/10 border border-white/30 rounded p-3 text-chalk-white focus:outline-none focus:border-chalk-blue text-lg"
              disabled={submitted}
            >
              <option value="" className="text-black">-- Select Country --</option>
              {COUNTRY_STATS.map(c => (
                <option key={c.id} value={c.id} className="text-black">{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs">
            <label className="font-bold text-chalk-red text-xl">Lowest Overall System</label>
            <select 
              value={lowestGuess}
              onChange={(e) => {
                setLowestGuess(e.target.value);
                setSubmitted(false);
              }}
              className="bg-white/10 border border-white/30 rounded p-3 text-chalk-white focus:outline-none focus:border-chalk-red text-lg"
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
          <p className="text-center text-chalk-red mb-4 text-xl">
            Please choose different countries for best and lowest.
          </p>
        )}

        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            disabled={!bestGuess || !lowestGuess || bestGuess === lowestGuess || submitted}
            variant="secondary"
            className="text-2xl px-12 py-3"
          >
            {submitted ? 'Opinion Submitted' : 'Submit Opinion'}
          </Button>
        </div>
      </div>

      {/* Community Votes Section */}
      {submitted && (
        <div id="feedback-section" className="mt-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
            {/* Community Votes Chart */}
          <div className="max-w-5xl mx-auto bg-[#1a261d] p-8 rounded-xl border-2 border-white/10 shadow-2xl">
            <h3 className="text-4xl text-center mb-8 text-chalk-white">
              Community Consensus
            </h3>
            <p className="text-center mb-8 text-chalk-white/60 text-xl">
              See how others voted for Best and Lowest systems ({submissions.length} votes).
            </p>
            
            {/* Chart */}
            <div className="h-[400px] w-full mb-12">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#ffffff" angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#ffffff" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff44', color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="bestVotes" name="Voted Best" fill="#81d4fa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lowestVotes" name="Voted Lowest" fill="#ef9a9a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Votes Table */}
            <div className="overflow-x-auto">
              <h4 className="text-3xl mb-4 text-chalk-white/80">All Votes So Far</h4>
              <table className="w-full text-left border-collapse text-xl">
                <thead>
                  <tr className="border-b border-white/20 text-chalk-yellow">
                    <th className="p-3 font-bold">Timestamp</th>
                    <th className="p-3 font-bold">Voted Best</th>
                    <th className="p-3 font-bold">Voted Lowest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {submissions.slice().reverse().map(sub => {
                    const countryBest = COUNTRY_STATS.find(c => c.id === sub.bestCountry);
                    const countryWorst = COUNTRY_STATS.find(c => c.id === sub.worstCountry);
                    return (
                      <tr key={sub.id} className="hover:bg-white/5">
                        <td className="p-3 text-lg text-chalk-white/60">
                          {new Date(sub.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-chalk-blue">
                          {countryBest?.name || sub.bestCountry}
                        </td>
                        <td className="p-3 font-bold text-chalk-red">
                          {countryWorst?.name || sub.worstCountry}
                        </td>
                      </tr>
                    );
                  })}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-chalk-white/40 italic">
                        No votes yet. Be the first!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Previously "All Votes Table & Chart" section was here, moved inside submitted condition above */}
    </div>
  );
}
