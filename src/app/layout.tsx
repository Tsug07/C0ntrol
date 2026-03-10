import React from 'react';
import '@/styles/globals.css';
import LayoutClient from '@/components/LayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'C0ntrol - Sistema de Gestão',
  description: 'Sistema de Gestão e Controle - CNDs, Links CND e Rotinas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}