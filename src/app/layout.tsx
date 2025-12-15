'use client';

import React, { useState } from 'react';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);

  return (
    <html lang="pt-BR">
      <head>
        <title>C0ntrol - Sistema de Gestão</title>
        <meta name="description" content="Sistema de Gestão e Controle - CNDs, Links CND e Rotinas" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <Navbar onCollapseChange={setIsNavbarCollapsed} />
        <main
          className={`min-h-screen p-8 transition-all duration-300 ${
            isNavbarCollapsed ? 'ml-20' : 'ml-72'
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}