import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const baseStyles = "px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 border-2";
  
  const variants = {
    primary: "bg-chalk-white text-background border-chalk-white hover:bg-transparent hover:text-chalk-white",
    secondary: "bg-chalk-yellow text-background border-chalk-yellow hover:bg-transparent hover:text-chalk-yellow",
    outline: "bg-transparent text-chalk-white border-chalk-white hover:bg-chalk-white hover:text-background",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

