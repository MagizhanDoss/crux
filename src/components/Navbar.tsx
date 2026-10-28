/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeMode, User } from '../types.ts';

interface NavbarProps {
  activeTab: 'discover' | 'validate' | 'brief' | 'database';
  setActiveTab: (tab: 'discover' | 'validate' | 'brief' | 'database') => void;
  onOpenPitch: () => void;
  onOpenShare: () => void;
  exploringCount: number;
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPitch,
  onOpenShare,
  currentUser,
  onOpenLogin,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5 border-b border-[var(--border-card)] bg-[var(--bg-header)] backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Zone 1: Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('discover');
        }}
        className="text-xl font-bold tracking-tight text-[var(--text-heading)] whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="font-serif italic text-[var(--accent-teal)]">Crux</span>
        <span className="text-xs font-mono font-medium text-[var(--text-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">
          COGNIHUB · DEX26297
        </span>
      </a>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-[var(--text-muted)]">
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'discover'
              ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)] pb-0.5'
              : 'hover:text-[var(--text-heading)]'
          }`}
        >
          Discover Problems
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('validate')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'validate'
              ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)] pb-0.5'
              : 'hover:text-[var(--text-heading)]'
          }`}
        >
          Validate Idea
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brief')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'brief'
              ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)] pb-0.5'
              : 'hover:text-[var(--text-heading)]'
          }`}
        >
          Problem Brief
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'database'
              ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)] pb-0.5'
              : 'hover:text-[var(--text-heading)]'
          }`}
        >
          Database Hub & API
        </button>

        <button
          type="button"
          onClick={onOpenShare}
          className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors whitespace-nowrap shrink-0"
        >
          + Submit Problem
        </button>
      </nav>

      {/* Zone 3: Actions - Theme Toggle + Pitch Button + Login Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Theme Toggle Button (Dark to White / White to Dark) */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to White (Light) Theme' : 'Switch to Dark Theme'}
          title={theme === 'dark' ? 'Switch to White (Light) Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] hover:text-[var(--accent-teal)] transition-all cursor-pointer flex items-center justify-center text-sm shadow-sm"
        >
          {theme === 'dark' ? (
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span>☀️</span>
              <span className="hidden sm:inline text-[11px] text-[var(--text-muted)]">Light</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span>🌙</span>
              <span className="hidden sm:inline text-[11px] text-[var(--text-muted)]">Dark</span>
            </span>
          )}
        </button>

        {/* 1-Minute Pitch Button */}
        <button
          type="button"
          onClick={onOpenPitch}
          className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-[var(--accent-amber)] bg-[var(--accent-amber-bg)] border border-[var(--accent-amber)]/30 rounded-lg hover:opacity-90 transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Dexathon Pitch
        </button>

        {/* Log In Button / User Profile */}
        {currentUser ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--accent-teal)] text-[var(--text-heading)] text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-[var(--accent-teal)] text-slate-950 font-bold flex items-center justify-center text-[10px]">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-[100px] truncate hidden md:inline">{currentUser.name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">▼</span>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <div className="font-bold text-[var(--text-heading)] truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{currentUser.email}</div>
                  <div className="text-[10px] font-mono text-[var(--accent-teal)] mt-1">
                    Team: {currentUser.teamName} ({currentUser.teamId})
                  </div>
                </div>

                <div className="space-y-1 py-1 text-slate-300">
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Role: <span className="text-[var(--text-main)] font-medium">{currentUser.role || 'Innovator'}</span>
                  </div>
                  {currentUser.institution && (
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      College: <span className="text-[var(--text-main)]">{currentUser.institution}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-2">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-1.5 px-2.5 rounded text-left text-xs text-rose-400 hover:bg-rose-500/10 font-semibold transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Sign Out</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="py-1.5 px-3.5 text-xs font-bold text-white bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Log In</span>
          </button>
        )}
      </div>
    </header>
  );
};
