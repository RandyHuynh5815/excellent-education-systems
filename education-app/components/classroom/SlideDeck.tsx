'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CountryCard {
  country: string;
  ranking: number;
  fact1: string;
  fact2: string;
  fact3: string;
}

export function SlideDeck() {
  const [cards, setCards] = useState<CountryCard[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load CSV once
  useEffect(() => {
    Papa.parse('/country_facts_ranked.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = (results.data as any[])
          .map((row) => ({
            country: row.country,
            ranking: Number(row.ranking),
            fact1: row.fact1,
            fact2: row.fact2,
            fact3: row.fact3,
          }))
          .filter((card) => card.country && !isNaN(card.ranking))
          .sort((a, b) => a.ranking - b.ranking); // 1..80

        setCards(data);
        setIndex(0);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error loading CSV:', error);
        setLoading(false);
      },
    });
  }, []);

  const total = cards.length;

  // Infinite loop: move index and wrap around
  const goNext = () => {
    if (!total) return;
    setIndex((i) => (i + 1) % total);
  };

  const goPrev = () => {
    if (!total) return;
    setIndex((i) => (i - 1 + total) % total);
  };

  const handlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    trackMouse: true,
  });

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-chalk-white/50 italic">
        Loading country facts...
      </div>
    );
  }

  if (!total) {
    return (
      <div className="h-full w-full flex items-center justify-center text-chalk-white/50 italic">
        No data available
      </div>
    );
  }

  const current = cards[index];

  return (
    <div
      {...handlers}
      className="w-full h-full flex flex-col items-center justify-center relative p-6"
    >
      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl min-h-[500px] bg-[#fffef5] border-4 border-chalk-white rounded-lg p-8 shadow-2xl"
          style={{
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            fontFamily: 'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
            letterSpacing: '0.01em',
          }}
        >
          {/* Country Name - Large and Handwritten at Top */}
          <div className="mb-8 pb-6 border-b-4 border-black/20">
            <h1 
              className="text-5xl font-bold text-black mb-3"
              style={{
                fontFamily: 'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
                letterSpacing: '0.03em',
                transform: 'rotate(-0.5deg)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {current.country}
            </h1>
            <div 
              className="text-xl text-black/70"
              style={{ 
                transform: 'rotate(0.3deg)',
                fontFamily: 'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
              }}
            >
              Math Rank: <span className="font-bold text-black">{current.ranking}/80</span>
            </div>
          </div>

          {/* Facts - Handwritten Style */}
          <div className="space-y-6 text-xl text-black leading-relaxed">
            <div 
              className="relative pl-10"
              style={{ 
                transform: 'rotate(0.2deg)',
                fontFamily: 'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
              }}
            >
              <span 
                className="absolute left-0 text-3xl text-black"
                style={{ transform: 'rotate(-5deg)', top: '-2px', lineHeight: '1' }}
              >
                •
              </span>
              <span style={{ letterSpacing: '0.01em', color: '#000' }}>{current.fact1}</span>
            </div>
            <div 
              className="relative pl-10"
              style={{ 
                transform: 'rotate(-0.15deg)',
                fontFamily: 'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
              }}
            >
              <span 
                className="absolute left-0 text-3xl text-black"
                style={{ transform: 'rotate(3deg)', top: '-2px', lineHeight: '1' }}
              >
                •
              </span>
              <span style={{ letterSpacing: '0.01em', color: '#000' }}>{current.fact2}</span>
            </div>
            <div 
              className="relative pl-10"
              style={{ 
                transform: 'rotate(0.25deg)',
                fontFamily: 'var(--font-patrick), "Patrick Hand", "Comic Sans MS", cursive',
              }}
            >
              <span 
                className="absolute left-0 text-3xl text-black"
                style={{ transform: 'rotate(-2deg)', top: '-2px', lineHeight: '1' }}
              >
                •
              </span>
              <span style={{ letterSpacing: '0.01em', color: '#000' }}>{current.fact3}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left arrow */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-chalk-white/20 hover:bg-chalk-white/30 border-2 border-chalk-white/40 flex items-center justify-center text-chalk-white text-2xl transition-all hover:scale-110 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right arrow */}
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-chalk-white/20 hover:bg-chalk-white/30 border-2 border-chalk-white/40 flex items-center justify-center text-chalk-white text-2xl transition-all hover:scale-110 z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-6 flex gap-2 flex-wrap justify-center max-w-full px-4">
        {cards.slice(0, Math.min(20, total)).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all ${
              i === index
                ? 'w-4 h-4 bg-chalk-yellow'
                : 'w-2 h-2 bg-chalk-white/40 hover:bg-chalk-white/60'
            } rounded-full`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
        {total > 20 && (
          <span className="text-chalk-white/60 text-xs ml-2">
            +{total - 20} more
          </span>
        )}
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 text-sm text-chalk-white/60">
        {index + 1} / {total}
      </div>
    </div>
  );
}

