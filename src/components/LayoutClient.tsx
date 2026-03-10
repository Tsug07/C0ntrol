'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);

  return (
    <>
      <Navbar onCollapseChange={setIsNavbarCollapsed} />
      <main
        className={`min-h-screen p-8 transition-all duration-300 ${
          isNavbarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {children}
      </main>
    </>
  );
}
