'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
// Student component - cartoon-style student at a desk
function Student({ className, delay = 0, hairColor = '#4a3728', shirtColor = 'bg-chalk-blue' }: { className: string; delay?: number; hairColor?: string; shirtColor?: string }) {
  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      {/* Student head */}
      <div className="relative mb-1">
        <div className="w-12 h-12 bg-[#ffd699] rounded-full border-2 border-[#e6b84d] shadow-md">
          {/* Eyes */}
          <div className="absolute top-4 left-2 w-2 h-2 bg-[#333] rounded-full" />
          <div className="absolute top-4 right-2 w-2 h-2 bg-[#333] rounded-full" />
          {/* Smile */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-[#333] rounded-b-full" />
        </div>
        {/* Hair */}
        <div 
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-4 rounded-t-full" 
          style={{ backgroundColor: hairColor }}
        />
      </div>
      {/* Body/shoulders */}
      <div className={`w-14 h-6 ${shirtColor} rounded-t-lg -mt-1`} />
      {/* Desk */}
      <div className="w-20 h-4 bg-[#8B4513] rounded shadow-md border-2 border-[#654321] -mt-1" />
    </motion.div>
  );
}

// Teacher component
function Teacher({ isZooming }: { isZooming: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isZooming ? 0 : 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {/* Teacher head */}
      <div className="relative mb-1">
        <div className="w-16 h-16 bg-[#ffd699] rounded-full border-2 border-[#e6b84d] shadow-lg">
          {/* Eyes (behind glasses) */}
          <div className="absolute top-5 left-3 w-2.5 h-2.5 bg-[#333] rounded-full" />
          <div className="absolute top-5 right-3 w-2.5 h-2.5 bg-[#333] rounded-full" />
          {/* Smile */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-2 border-b-2 border-[#333] rounded-b-full" />
        </div>
        {/* Hair */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-5 bg-[#2d2d2d] rounded-t-full" />
        {/* Glasses */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-5 h-4 border-2 border-[#333] rounded-full bg-white/20" />
          <div className="w-5 h-4 border-2 border-[#333] rounded-full bg-white/20" />
        </div>
      </div>
      {/* Body */}
      <div className="w-20 h-10 bg-chalk-red rounded-t-lg -mt-1 relative">
        {/* Arm holding pointer */}
        <div className="absolute -top-1 right-0 w-4 h-8 bg-[#ffd699] rounded-full rotate-[-50deg] origin-bottom" />
        {/* Pointer stick - starts from arm, points up toward whiteboard */}
        <div className="absolute -top-16 right-2 w-1.5 h-20 bg-[#8B4513] rotate-[25deg] origin-bottom rounded shadow" />
      </div>
      <p className="mt-2 text-chalk-white text-sm font-bold">Teacher</p>
    </motion.div>
  );
}

// Handwritten text component using SVG stroke animation
function HandwrittenText({ text, onComplete, duration = 4 }: { text: string; onComplete?: () => void; duration?: number }) {
  const [isComplete, setIsComplete] = useState(false);
  const pathRef = useRef<SVGTextElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    // Calculate approximate path length based on text
    if (pathRef.current) {
      const length = pathRef.current.getComputedTextLength();
      setPathLength(length);
    }
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      onComplete?.();
    }, duration * 1000);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <svg 
      className="w-full h-auto overflow-visible" 
      viewBox="0 0 600 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <style>{`
          @keyframes handwrite {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes fillIn {
            to {
              fill-opacity: 1;
            }
          }
        `}</style>
      </defs>
      <text
        ref={pathRef}
        x="300"
        y="50"
        textAnchor="middle"
        className="text-lg"
        style={{
          fontFamily: 'var(--font-patrick), "Patrick Hand", cursive',
          fontSize: '18px',
          fill: 'rgba(252, 252, 252, 0.9)',
          fillOpacity: 0,
          stroke: 'rgba(252, 252, 252, 0.9)',
          strokeWidth: 1,
          strokeDasharray: pathLength || 2000,
          strokeDashoffset: pathLength || 2000,
          animation: `handwrite ${duration}s ease forwards, fillIn 0.5s ease ${duration}s forwards`,
        }}
      >
        {text}
      </text>
    </svg>
  );
}

// Handwriting animation - reveals text letter by letter, keeping words together
function HandwrittenParagraph({ text, onComplete, duration = 1 }: { text: string; onComplete?: () => void; duration?: number }) {
  const [visibleChars, setVisibleChars] = useState(0);
  const words = text.split(' ');
  
  // Calculate total characters for timing
  const totalChars = text.length;

  useEffect(() => {
    const charDelay = (duration * 1000) / totalChars;
    const interval = setInterval(() => {
      setVisibleChars(prev => {
        if (prev >= totalChars) {
          clearInterval(interval);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, charDelay);
    return () => clearInterval(interval);
  }, [totalChars, duration, onComplete]);

  let charIndex = 0;

  return (
    <span style={{ fontFamily: 'var(--font-patrick), "Patrick Hand", cursive' }}>
      {words.map((word, wordIdx) => {
        const wordChars = word.split('');
        const wordStartIndex = charIndex;
        charIndex += word.length + 1; // +1 for the space

        return (
          <span key={wordIdx} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: '0.3em' }}>
            {wordChars.map((char, charIdx) => {
              const globalIndex = wordStartIndex + charIdx;
              return (
                <motion.span
                  key={charIdx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={globalIndex < visibleChars ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.05 }}
                  style={{ display: 'inline-block' }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

export default function Home() {
  const [isZooming, setIsZooming] = useState(false);
  const [step, setStep] = useState(1); // 1: initial, 2: erasing, 3: typing new text, 4: done
  const [isErasing, setIsErasing] = useState(false);
  const [showNewText, setShowNewText] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [firstTextComplete, setFirstTextComplete] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    setStep(2);
    setIsErasing(true);
    // After eraser animation completes, start typing
    setTimeout(() => {
      setIsErasing(false);
      setShowNewText(true);
      setStep(3);
    }, 1500); // Duration of eraser animation
  };

  const handleExplore = () => {
    setIsZooming(true);
    setTimeout(() => {
      router.push('/classroom');
    }, 1000);
  };

  const text1 = "Welcome to class! Step inside to explore how education systems compare around the world.";
  const text2 = "What makes a good education system? Explore different education systems around the world and see what fits your definition of a good system.";

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#2d3e30] flex flex-col">
      {/* Classroom scene container */}
      <motion.div
        className="flex-1 flex flex-col relative"
        initial={{ scale: 1 }}
        animate={isZooming ? { scale: 3, y: '40%' } : { scale: 1 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Top area with whiteboard */}
        <div className="flex-1 flex items-center justify-center relative px-8 pt-8">
          {/* Whiteboard with welcome message */}
          <div
            className="relative w-full max-w-[800px] h-[45vh] bg-[#1a261d] border-[12px] border-[#8d6e63] rounded-lg shadow-2xl flex flex-col items-center justify-center p-8"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          >
            {/* Chalk tray */}
            <div className="absolute bottom-0 w-full h-3 bg-[#8d6e63] opacity-60 rounded-b" />
            
            {/* Welcome content on whiteboard */}
            <motion.div
              className="text-center"
              animate={isZooming ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 text-chalk-white drop-shadow-md font-bold">
                Global Education Explorer
              </h1>
              
              {/* Text area with eraser animation */}
              <div className="relative min-h-[120px] mb-8 max-w-2xl">
                {/* Original text - visible in step 1 and during erasing */}
                {(step === 1 || isErasing) && (
                  <div className="relative overflow-hidden">
                    <p className="text-lg md:text-xl lg:text-2xl text-chalk-white/90 font-light leading-relaxed">
                      <HandwrittenParagraph 
                        text={text1} 
                        onComplete={() => setFirstTextComplete(true)}
                        duration={2}
                      />
                    </p>
                    
                    {/* Eraser overlay that wipes from left to right */}
                    {isErasing && (
                      <motion.div
                        className="absolute inset-0 bg-[#1a261d] origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      />
                    )}
                    
                    {/* Eraser icon */}
                    {isErasing && (
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 z-10"
                        initial={{ left: '-40px' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      >
                        {/* Eraser shape */}
                        <div className="w-10 h-6 bg-[#f5e6d3] rounded-sm shadow-lg border border-[#d4c4b0] flex items-center justify-center">
                          <div className="w-8 h-1 bg-[#e8d5c4] rounded" />
                        </div>
                        {/* Chalk dust particles */}
                        <motion.div
                          className="absolute -bottom-1 left-1/2 w-1 h-1 bg-chalk-white/60 rounded-full"
                          animate={{ y: [0, 10], opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      </motion.div>
                    )}
                  </div>
                )}
                
                {/* New text with handwritten effect */}
                {showNewText && (
                  <p className="text-lg md:text-xl lg:text-2xl text-chalk-white/90 font-light leading-relaxed">
                    <HandwrittenParagraph 
                      text={text2} 
                      onComplete={() => setTypingComplete(true)}
                      duration={2}
                    />
                  </p>
                )}
              </div>
              
              {/* Buttons */}
              {step === 1 && firstTextComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    variant="secondary" 
                    className="text-lg md:text-xl lg:text-2xl px-6 md:px-8 py-3 md:py-4"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </motion.div>
              )}
              
              {showNewText && typingComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    variant="secondary" 
                    className="text-lg md:text-xl lg:text-2xl px-6 md:px-8 py-3 md:py-4"
                    onClick={handleExplore}
                    disabled={isZooming}
                  >
                    {isZooming ? 'Entering classroom...' : 'Begin Exploring'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Classroom floor with students and teacher */}
        <motion.div 
          className="h-[35%] bg-[#3e2b26] border-t-8 border-[#5d4037] relative"
          animate={isZooming ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Teacher on the left */}
          <div className="absolute left-[5%] top-4">
            <Teacher isZooming={isZooming} />
          </div>

          {/* Students - Front Row */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8 md:gap-12">
            <Student className="" delay={0.1} hairColor="#4a3728" />
            <Student className="" delay={0.2} hairColor="#1a1a1a" />
            <Student className="" delay={0.3} hairColor="#8B4513" />
            <Student className="" delay={0.4} hairColor="#2d2d2d" />
          </div>

          {/* Students - Back Row */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex gap-6 md:gap-10">
            <Student className="" delay={0.5} hairColor="#654321" />
            <Student className="" delay={0.6} hairColor="#1a1a1a" />
            <Student className="" delay={0.7} hairColor="#4a3728" />
            <Student className="" delay={0.8} hairColor="#2d2d2d" />
            <Student className="" delay={0.9} hairColor="#8B4513" />
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-chalk-white/50 z-30 text-sm"
        animate={isZooming ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p>Data Visualization Project • Fall 2025</p>
      </motion.div>
    </main>
  );
}
