import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-lg p-8 border-2 border-purple-100 transition-all duration-500 ${
        hover ? 'hover:shadow-2xl hover:border-purple-400 hover:-translate-y-3' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
