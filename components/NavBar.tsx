'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'ホーム' },
  { href: '/stats', label: '成績' },
  { href: '/schedule', label: 'スケジュール' },
  { href: '/ai', label: 'AI展望' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-brand-primary)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: 'var(--color-text-inverse)' }}
          >
            <span>⚾</span>
            <span>ベイスターズINFO</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.85)',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md"
            style={{ color: 'var(--color-text-inverse)' }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="メニュー"
          >
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    color: isActive ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.85)',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
