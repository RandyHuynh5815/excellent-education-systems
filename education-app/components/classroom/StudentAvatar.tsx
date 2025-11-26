'use client';

import { User } from 'lucide-react';
import { Student } from '@/lib/types';
import { motion } from 'framer-motion';

interface StudentAvatarProps {
  student: Student;
  isSelected: boolean;
  onClick: (student: Student) => void;
}

export function StudentAvatar({ student, isSelected, onClick }: StudentAvatarProps) {
  return (
    <motion.div
      className="absolute cursor-pointer flex flex-col items-center group"
      style={{ top: student.position.top, left: student.position.left }}
      onClick={() => onClick(student)}
      whileHover={{ scale: 1.1, y: -5 }}
      animate={isSelected ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
    >
      <div className={`
        relative p-3 rounded-full border-4 transition-colors
        ${isSelected ? 'bg-chalk-yellow border-chalk-white text-black' : 'bg-transparent border-chalk-white/50 text-chalk-white hover:border-chalk-yellow hover:text-chalk-yellow'}
      `}>
        <User size={48} strokeWidth={2} />
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-black/80 text-white text-sm rounded pointer-events-none z-20">
          <p className="text-center">"{student.name}"</p>
          <p className="text-xs text-center text-gray-300">Has a question...</p>
        </div>
      </div>
      
      <div className={`mt-2 font-bold text-lg ${isSelected ? 'text-chalk-yellow' : 'text-chalk-white/80'}`}>
        {student.name}
      </div>
    </motion.div>
  );
}

