'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Navbar({ onCollapseChange }: NavbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const modules = [
    {
      name: 'CNDs',
      href: '/cnds',
      description: 'Gerenciar certidões',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Links CND',
      href: '/links-cnd',
      description: 'Portais de acesso',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      name: 'Rotina',
      href: '/rotina',
      description: 'Automação',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100 min-h-screen shadow-2xl border-r border-gray-800 fixed left-0 top-0 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className={`flex flex-col h-full ${isCollapsed ? 'p-3' : 'p-6'}`}>
        {/* Header */}
        <div className={`mb-10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link
            href="/"
            className={`text-3xl font-bold text-white hover:text-gray-300 transition-all duration-300 ${
              isCollapsed ? 'hidden' : 'block'
            }`}
          >
            C<span className="text-gray-400">0</span>ntrol
          </Link>

          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className={`p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 ${
              isCollapsed ? 'w-full flex justify-center' : ''
            }`}
            aria-label="Toggle sidebar"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        {!isCollapsed && (
          <div className="mb-8 -mt-6">
            <p className="text-sm text-gray-400 font-light">Sistema de Gestão</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {/* Home */}
            <li>
              <Link
                href="/"
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-4 px-4'} py-3 rounded-lg transition-all duration-200 group ${
                  pathname === '/'
                    ? 'bg-gray-800 text-white border-l-4 border-white'
                    : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                }`}
                title={isCollapsed ? 'Home' : ''}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {!isCollapsed && (
                  <div className="flex-1">
                    <span className="font-medium block">Home</span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-400">Página inicial</span>
                  </div>
                )}
              </Link>
            </li>

            {/* Divider */}
            <li className="py-2">
              <div className="border-t border-gray-800"></div>
            </li>

            {/* Modules */}
            {modules.map((module) => (
              <li key={module.name}>
                <Link
                  href={module.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-4 px-4'} py-3 rounded-lg transition-all duration-200 group ${
                    pathname === module.href
                      ? 'bg-gray-800 text-white border-l-4 border-white'
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                  title={isCollapsed ? module.name : ''}
                >
                  {module.icon}
                  {!isCollapsed && (
                    <div className="flex-1">
                      <span className="font-medium block">{module.name}</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400">
                        {module.description}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`mt-auto pt-6 border-t border-gray-800 ${isCollapsed ? 'px-0' : ''}`}>
          {!isCollapsed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                  U
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-300">Usuário</p>
                  <p className="text-xs text-gray-500">user@c0ntrol.com</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center">© 2025 C0ntrol</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300" title="Usuário">
                U
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}