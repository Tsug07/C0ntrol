import React from 'react';
import Link from 'next/link';
import Card from './Card';

interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export default function ModuleCard({ icon, title, description, href }: ModuleCardProps) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer group">
        <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-purple-900 mb-4">{title}</h3>
        <p className="text-base text-purple-700 leading-relaxed mb-6">{description}</p>
        <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-800">
          Acessar módulo
          <svg
            className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
