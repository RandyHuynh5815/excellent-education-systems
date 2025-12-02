"use client";

import { User } from "lucide-react";
import { Student } from "@/lib/types";
import { motion } from "framer-motion";

interface StudentAvatarProps {
  student: Student;
  isSelected: boolean;
  onClick: (student: Student) => void;
}

export function StudentAvatar({
  student,
  isSelected,
  onClick,
}: StudentAvatarProps) {
  return (
    <motion.div
      className="absolute cursor-pointer flex flex-col items-center group pointer-events-auto"
      style={{ top: student.position.top, left: student.position.left }}
      onClick={() => onClick(student)}
      whileHover={{ scale: 1.1, y: -5 }}
      animate={isSelected ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
    >
      <div
        className={`
        relative p-3 rounded-full border-4 transition-colors
        ${
          isSelected
            ? "bg-chalk-yellow border-chalk-white text-black"
            : "bg-transparent border-chalk-white/50 text-chalk-white hover:border-chalk-yellow hover:text-chalk-yellow"
        }
      `}
      >
        <User size={48} strokeWidth={2} />

        {/* Tooltip - positioned above the whiteboard */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-black/90 text-white text-sm rounded-lg shadow-lg pointer-events-none z-[60]">
          <p className="text-center font-semibold">
            &ldquo;{student.name}&rdquo;
          </p>
          <p className="text-xs text-center text-gray-300 mt-1">
            Has a question...
          </p>
        </div>
      </div>

      <div
        className={`mt-2 font-bold text-lg ${
          isSelected ? "text-chalk-yellow" : "text-chalk-white/80"
        }`}
      >
        {student.name}
      </div>
    </motion.div>
  );
}
