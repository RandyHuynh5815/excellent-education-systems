import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Decorative background elements could go here */}
      
      <div className="z-10 max-w-2xl bg-black/20 p-12 rounded-2xl backdrop-blur-sm border-2 border-white/10 shadow-xl">
        <h1 className="text-6xl mb-6 text-chalk-white drop-shadow-md">
          Global Education Explorer
        </h1>
        
        <p className="text-2xl mb-8 text-chalk-white/90 font-light leading-relaxed">
          Welcome to class! Step inside to explore how education systems compare around the world.
          Click on students to hear their questions and discover data on the whiteboard.
        </p>
        
        <Link href="/classroom">
          <Button variant="secondary" className="text-2xl px-8 py-4">
            Begin Exploring
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-10 opacity-50 text-chalk-white/60">
        <p>Data Visualization Project &bull; Fall 2025</p>
      </div>
    </main>
  );
}
