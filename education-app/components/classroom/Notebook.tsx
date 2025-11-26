'use client';

import { useState } from 'react';
import { Book, ChevronRight } from 'lucide-react';

export function Notebook() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState('');

  const addNote = () => {
    if (currentNote.trim()) {
      setNotes([...notes, currentNote]);
      setCurrentNote('');
    }
  };

  return (
    <>
      <div 
        className={`
          fixed left-0 bottom-0 h-96 w-72 bg-[#fdfbf7] text-gray-800
          shadow-2xl transform transition-transform duration-300 z-40
          rounded-tr-lg border-r-8 border-b-8 border-gray-300
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundImage: 'linear-gradient(#e1e1e1 1px, transparent 1px)', backgroundSize: '100% 24px', paddingTop: '24px' }}
      >
        <div className="bg-red-500 h-full w-[2px] absolute left-8 top-0"></div>
        
        <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-300 ml-8">
          <h3 className="font-handwriting font-bold text-xl">My Notes</h3>
          <button onClick={() => setIsOpen(false)} className="hover:bg-gray-200 rounded p-1">
            <ChevronRight />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 ml-8 font-handwriting">
          <ul className="list-disc pl-4 space-y-2">
            {notes.map((note, i) => (
              <li key={i} className="text-lg leading-6">{note}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 ml-8 border-t border-gray-300 bg-[#fdfbf7]">
          <input 
            type="text" 
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNote()}
            placeholder="Jot down a note..."
            className="w-full bg-transparent border-b border-gray-400 focus:outline-none font-handwriting"
          />
        </div>
      </div>

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="absolute left-0 bottom-8 bg-[#fdfbf7] p-3 rounded-r shadow-lg text-gray-800 hover:translate-x-1 transition-transform z-30 flex items-center gap-2 border border-gray-300"
        >
          <Book size={24} />
          <span className="font-bold">Notes</span>
        </button>
      )}
    </>
  );
}

