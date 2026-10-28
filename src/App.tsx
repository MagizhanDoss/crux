/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ProblemCard } from './components/ProblemCard.tsx';
import { ProblemDetailModal } from './components/ProblemDetailModal.tsx';
import { IdeaValidator } from './components/IdeaValidator.tsx';
import { BriefGenerator } from './components/BriefGenerator.tsx';
import { DatabaseHub } from './components/DatabaseHub.tsx';
import { ShareProblemModal } from './components/ShareProblemModal.tsx';
import { PitchModal } from './components/PitchModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { GooglePagination } from './components/GooglePagination.tsx';
import { INITIAL_PROBLEM_DATABASE } from './data/problemsData.ts';
import {
  Difficulty,
  ProblemStatement,
  Sector,
  Skill,
  SourceType,
  ThemeMode,
  User,
  ValidationResult,
} from './types.ts';

const SECTORS: Sector[] = [
  'All',
  'Agriculture',
  'Healthcare',
  'Civic & Transport',
  'Water & Sanitation',
  'Education & Skilling',
  'Clean Energy & Climate',
  'Governance & PDS',
  'Small Business & Trade',
];

const SOURCES: SourceType[] = [
  'All',
  'Smart India Hackathon (SIH)',
  'CPGRAMS (Citizen Grievances)',
  'data.gov.in (Open Gov Data)',
  'Grassroots / Community',
];

export default function App() {
  const [problems, setProblems] = useState<ProblemStatement[]>(INITIAL_PROBLEM_DATABASE);
  const [activeTab, setActiveTab] = useState<'discover' | 'validate' | 'brief' | 'database'>('discover');
  const [selectedProblem, setSelectedProblem] = useState<ProblemStatement>(INITIAL_PROBLEM_DATABASE[0]);
  const [dossierProblem, setDossierProblem] = useState<ProblemStatement | null>(null);

  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('crux_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('crux_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // User-friendly Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try {
      localStorage.setItem('crux_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'light' ? 'White (Light)' : 'Dark'} Theme`);
  };

  // Filter States
  const [selectedSector, setSelectedSector] = useState<Sector>('All');
  const [selectedSource, setSelectedSource] = useState<SourceType>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('All');
  const [selectedSkill, setSelectedSkill] = useState<Skill | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'exploring' | 'hours_asc' | 'hours_desc'>('exploring');
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination States (Google-style bottom pagination)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Gemini-Powered Semantic Search State
  const [searchMode, setSearchMode] = useState<'semantic' | 'keyword'>('semantic');
  const [semanticQuery, setSemanticQuery] = useState('');
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<ProblemStatement[] | null>(null);
  const [semanticMeta, setSemanticMeta] = useState<{
    intent_summary?: string;
    identified_domains?: string[];
    ai_powered?: boolean;
    query?: string;
  } | null>(null);

  const executeSemanticSearch = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : semanticQuery).trim();
    if (!q) {
      showToast('Please enter a natural language concept to search.');
      return;
    }
    if (queryText !== undefined) {
      setSemanticQuery(queryText);
    }
    setIsSemanticSearching(true);
    try {
      const res = await fetch('/api/problems/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          sector: selectedSector,
          difficulty: selectedDifficulty,
          limit: 18,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setSemanticResults(data.results);
        setSemanticMeta({
          intent_summary: data.intent_summary,
          identified_domains: data.identified_domains,
          ai_powered: data.ai_powered,
          query: q,
        });
        setCurrentPage(1);
        showToast(
          data.ai_powered
            ? `✨ Found ${data.results.length} semantic matches via Gemini 3.8 Flash!`
            : `Found ${data.results.length} contextual matches.`
        );
      } else {
        showToast(data.error || 'No semantic matches found.');
      }
    } catch {
      showToast('Semantic search request failed, please retry.');
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const clearSemanticSearch = () => {
    setSemanticResults(null);
    setSemanticMeta(null);
    setSemanticQuery('');
    showToast('Cleared AI semantic search results');
  };

  // Reset pagination to Page 1 whenever any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSector,
    selectedSource,
    selectedDifficulty,
    selectedSkill,
    searchQuery,
    sortBy,
    showOnlyBookmarks,
  ]);

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('crux_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Validator States
  const [teamSkills, setTeamSkills] = useState<Skill[]>(['web', 'app', 'data']);
  const [availableHours, setAvailableHours] = useState(36);
  const [ideaText, setIdeaText] = useState(
    'A Progressive Web App allowing farmers to capture timestamped, sensor-verified crop damage photos with offline storage. The backend verifies photos against Sentinel-2 NDVI satellite reflectance curves and automatically files a geo-tagged compensation claim to PMFBY.'
  );
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Modals
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Fetch problems from server on load
  const loadProblems = async () => {
    try {
      const res = await fetch('/api/problems');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProblems(data);
          setSelectedProblem((prev) => data.find((d) => d.id === prev.id) || data[0]);
        }
      }
    } catch (err) {
      console.info('Backend initial fetch fallback:', err);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const toggleBookmark = (id: string) => {
    const isBookmarked = bookmarkedIds.includes(id);
    const updated = isBookmarked ? bookmarkedIds.filter((item) => item !== id) : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    try {
      localStorage.setItem('crux_bookmarks', JSON.stringify(updated));
    } catch {}
    showToast(isBookmarked ? 'Removed from bookmarks' : '★ Added to shortlisted problems');
  };

  const handleSelectProblem = (problem: ProblemStatement) => {
    setSelectedProblem(problem);
    fetch(`/api/problems/${problem.id}/explore`, { method: 'POST' }).catch(() => {});
    setProblems((prev) =>
      prev.map((p) => (p.id === problem.id ? { ...p, exploringCount: (p.exploringCount || 0) + 1 } : p))
    );
    setActiveTab('validate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`✓ Problem selected: ${problem.title.slice(0, 32)}...`);
  };

  const handleProblemAdded = (newProb: ProblemStatement) => {
    setProblems((prev) => [newProb, ...prev]);
    setSelectedProblem(newProb);
    setActiveTab('discover');
    showToast('✓ Real-world problem successfully posted to feed!');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`✓ Welcome, ${user.name}! Workspace synchronized.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('crux_user');
    } catch {}
    showToast('Signed out successfully.');
  };

  // Filter & Search Logic
  const filteredProblems = useMemo(() => {
    let result = semanticResults !== null ? [...semanticResults] : [...problems];

    if (showOnlyBookmarks) {
      result = result.filter((p) => bookmarkedIds.includes(p.id));
    }

    if (selectedSector !== 'All') {
      result = result.filter((p) => p.sector === selectedSector);
    }

    if (selectedSource !== 'All') {
      result = result.filter((p) => p.sourceType === selectedSource);
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter((p) => p.difficulty === selectedDifficulty);
    }

    if (selectedSkill !== 'All') {
      result = result.filter((p) => p.suggestedSkills.includes(selectedSkill));
    }

    // Keyword search filter (only in keyword mode or if semantic search is not active)
    if (searchMode === 'keyword' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.painPoint.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.sourceCode.toLowerCase().includes(q) ||
          p.beneficiaries.toLowerCase().includes(q) ||
          p.novelAngleOpportunity.toLowerCase().includes(q) ||
          p.pastClones.some((c) => c.name.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q)))
      );
    }

    // Sort order: if semantic search active, keep AI relevance rank unless user explicitly changed sort
    if (semanticResults === null || sortBy !== 'exploring') {
      if (sortBy === 'exploring') {
        result.sort((a, b) => (b.exploringCount || 0) - (a.exploringCount || 0));
      } else if (sortBy === 'hours_asc') {
        result.sort((a, b) => a.estimatedHours - b.estimatedHours);
      } else if (sortBy === 'hours_desc') {
        result.sort((a, b) => b.estimatedHours - a.estimatedHours);
      }
    }

    return result;
  }, [
    problems,
    semanticResults,
    searchMode,
    showOnlyBookmarks,
    bookmarkedIds,
    selectedSector,
    selectedSource,
    selectedDifficulty,
    selectedSkill,
    searchQuery,
    sortBy,
  ]);

  const hasActiveFilters =
    selectedSector !== 'All' ||
    selectedSource !== 'All' ||
    selectedDifficulty !== 'All' ||
    selectedSkill !== 'All' ||
    Boolean(searchQuery.trim()) ||
    Boolean(semanticResults) ||
    showOnlyBookmarks;

  const resetFilters = () => {
    setSelectedSector('All');
    setSelectedSource('All');
    setSelectedDifficulty('All');
    setSelectedSkill('All');
    setSearchQuery('');
    setSemanticResults(null);
    setSemanticMeta(null);
    setSemanticQuery('');
    setShowOnlyBookmarks(false);
    setCurrentPage(1);
    showToast('Filters cleared');
  };

  // Pagination calculations (Google-style multi-page navigation)
  const totalFilteredCount = filteredProblems.length;
  const effectivePageSize = pageSize === -1 ? totalFilteredCount : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / (effectivePageSize || 1)));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalFilteredCount);

  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice(startIndex, endIndex);
  }, [filteredProblems, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    const target = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(target);
    const anchor = document.getElementById('discover-feed-top');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        exploringCount={problems.reduce((acc, p) => acc + (p.exploringCount || 0), 0)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-7">
        {/* TAB 1: DISCOVER PROBLEMS */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono flex-wrap">
                <span className="text-[var(--accent-teal)] font-semibold">SMART INDIA HACKATHON & CPGRAMS DATASET</span>
                <span aria-hidden="true" className="opacity-50">·</span>
                <span>OPEN INNOVATION TRACK</span>
                <span aria-hidden="true" className="opacity-50">·</span>
                <span className="text-[var(--text-heading)]">SATHYABAMA DEXATHON 2026</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-heading)] tracking-tight leading-tight max-w-3xl">
                Find the problem <span className="italic text-[var(--accent-teal)]">worth solving.</span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
                Browse verified problem statements from Smart India Hackathon (SIH), citizen grievances (CPGRAMS), and Open Government Data (data.gov.in). Check originality against past clones, evaluate finishability for your team, and generate a submission brief.
              </p>
            </section>

            {/* Faceted Filters & Search Bar */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-sm transition-colors">
              {/* Sector Segmented Filter */}
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block mb-2">
                  Filter by Sector:
                </span>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sector filter">
                  {SECTORS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSector(sec)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        selectedSector === sec
                          ? 'bg-[var(--accent-teal)] text-white shadow-sm'
                          : 'text-[var(--text-main)] hover:bg-[var(--bg-inner)] bg-[var(--bg-inner)]/50 border border-[var(--border-subtle)]'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Mode Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchMode('semantic')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      searchMode === 'semantic'
                        ? 'bg-[var(--accent-teal)] text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] bg-[var(--bg-inner)]'
                    }`}
                  >
                    <span>✨</span>
                    <span>Semantic AI Search (Gemini 3.8 Flash)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode('keyword');
                      if (semanticResults) {
                        setSemanticResults(null);
                        setSemanticMeta(null);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      searchMode === 'keyword'
                        ? 'bg-[var(--accent-teal)] text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] bg-[var(--bg-inner)]'
                    }`}
                  >
                    <span>🔍</span>
                    <span>Simple Keyword Filter</span>
                  </button>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono">
                  {searchMode === 'semantic' ? 'Matches deep conceptual intent beyond keywords' : 'Fast client-side exact match'}
                </div>
              </div>

              {/* Semantic Mode Input vs Keyword Mode Input */}
              {searchMode === 'semantic' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <div className="relative flex-1 min-w-[260px]">
                      <input
                        type="text"
                        value={semanticQuery}
                        onChange={(e) => setSemanticQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') executeSemanticSearch();
                        }}
                        placeholder="Describe what you want to solve in plain English (e.g., 'stopping medicine spoilage in rural health centres' or 'potholes causing accidents')..."
                        className="w-full py-2.5 px-3 pl-9 pr-8 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                      />
                      <span className="absolute left-3 top-3 text-[var(--accent-teal)] text-xs">✨</span>
                      {semanticQuery && (
                        <button
                          type="button"
                          onClick={() => setSemanticQuery('')}
                          className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-heading)] text-xs cursor-pointer"
                          title="Clear input"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => executeSemanticSearch()}
                      disabled={isSemanticSearching}
                      className="py-2.5 px-4 text-xs font-semibold text-white bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
                    >
                      {isSemanticSearching ? (
                        <>
                          <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Gemini Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Search with Gemini</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Clickable Conceptual Prompts */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-0.5">
                    <span className="text-[var(--text-muted)] font-mono">Try semantic prompts:</span>
                    {[
                      'Preventing medicine & vaccine spoilage in rural clinics',
                      'Detecting potholes and road fractures with sensors',
                      'Crop loss from sudden unseasonal rains for small farmers',
                      'Sign language interpreter for deaf students in classrooms',
                      'Drinking water pipeline leaks in villages',
                      'Preventing power theft on low-tension distribution lines',
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => executeSemanticSearch(sample)}
                        className="text-left px-2 py-0.5 rounded bg-[var(--bg-inner)] hover:bg-[var(--accent-teal-bg)] text-[var(--text-main)] hover:text-[var(--accent-teal)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Secondary Filter Row: Keyword Search (if active), Source, Difficulty, Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-subtle)]">
                {searchMode === 'keyword' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Keyword filter (mandi, drone, sensor...)"
                      className="w-full py-2 px-3 pl-8 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                    />
                    <span className="absolute left-2.5 top-2.5 text-[var(--text-muted)] text-xs">🔍</span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2 text-[var(--text-muted)] hover:text-[var(--text-heading)] text-xs cursor-pointer p-0.5"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* Source Filter */}
                <div>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value as SourceType)}
                    className="w-full py-2 px-2.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                  >
                    <option value="All">All Authorities & Sources</option>
                    <option value="Smart India Hackathon (SIH)">Smart India Hackathon (SIH)</option>
                    <option value="CPGRAMS (Citizen Grievances)">CPGRAMS Grievances</option>
                    <option value="data.gov.in (Open Gov Data)">data.gov.in (Open Data)</option>
                    <option value="Grassroots / Community">Grassroots / Community</option>
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                    className="w-full py-2 px-2.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                  >
                    <option value="All">All Scopes / Difficulties</option>
                    <option value="Beginner">Beginner (24h)</option>
                    <option value="Intermediate">Intermediate (36h)</option>
                    <option value="Advanced">Advanced (48h)</option>
                    <option value="Research Track">Research Track</option>
                  </select>
                </div>

                {/* Sort Option */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full py-2 px-2.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] font-mono transition-colors"
                  >
                    <option value="exploring">
                      {semanticResults ? 'Sort: AI Semantic Relevance' : 'Sort: Most Teams Exploring'}
                    </option>
                    <option value="hours_asc">Sort: Sprint Time (Low → High)</option>
                    <option value="hours_desc">Sort: Sprint Time (High → Low)</option>
                  </select>
                </div>
              </div>

              {/* Filter Meta Bar & Active Chips */}
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)] flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>
                    Showing <strong className="text-[var(--text-heading)] font-mono tabular-nums">{totalFilteredCount > 0 ? `${startIndex + 1}–${endIndex}` : '0'}</strong> of{' '}
                    <strong className="text-[var(--text-heading)] font-mono tabular-nums">{totalFilteredCount}</strong> statements{' '}
                    {totalPages > 1 && (
                      <span className="text-[var(--accent-teal)] font-mono font-medium">(Page {safeCurrentPage} of {totalPages})</span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                    className={`cursor-pointer transition-colors font-medium ${
                      showOnlyBookmarks ? 'text-amber-500 font-bold' : 'hover:text-[var(--text-heading)]'
                    }`}
                  >
                    {showOnlyBookmarks ? '★ Showing Bookmarks' : `☆ Shortlisted (${bookmarkedIds.length})`}
                  </button>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[var(--accent-teal)] hover:underline cursor-pointer font-semibold ml-1"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-[var(--bg-inner)] p-1 rounded-lg border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`py-1 px-2.5 rounded text-xs transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[var(--bg-card)] text-[var(--text-heading)] font-semibold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                    }`}
                  >
                    Grid View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`py-1 px-2.5 rounded text-xs transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-[var(--bg-card)] text-[var(--text-heading)] font-semibold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                    }`}
                  >
                    Table View
                  </button>
                </div>
              </div>
            </div>

            {/* AI Intent & Conceptual Analysis Banner */}
            {semanticMeta && (
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--accent-teal)]/50 shadow-sm space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--accent-teal)]">
                    <span>✨ GEMINI 3.8 FLASH SEMANTIC ANALYSIS</span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-[var(--text-main)] font-normal">
                      {semanticMeta.ai_powered ? 'AI Concept Mapping' : 'Contextual Heuristic Match'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearSemanticSearch}
                    className="text-xs text-[var(--accent-teal)] hover:underline font-semibold cursor-pointer"
                  >
                    Clear AI Search (Show All {problems.length})
                  </button>
                </div>

                <div className="text-base font-serif font-bold text-[var(--text-heading)] leading-snug">
                  "{semanticMeta.intent_summary}"
                </div>

                {semanticMeta.identified_domains && semanticMeta.identified_domains.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                    <span className="text-[var(--text-muted)] font-mono text-[11px]">Identified Domains:</span>
                    {semanticMeta.identified_domains.map((dom) => (
                      <span
                        key={dom}
                        className="text-[11px] px-2 py-0.5 rounded bg-[var(--accent-teal-bg)] text-[var(--accent-teal)] font-medium border border-[var(--accent-teal)]/20"
                      >
                        {dom}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Anchor for Smooth Page Jumps */}
            <div id="discover-feed-top" className="scroll-mt-24" />

            {/* Problem Statements Display */}
            {filteredProblems.length === 0 ? (
              <div className="text-center py-16 p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm">
                <div className="text-3xl">🔍</div>
                <h3 className="font-serif text-xl font-bold text-[var(--text-heading)]">No problem statements match your filters</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  Try clearing your search term, changing the sector filter, or submit a new problem in the community intake form!
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="py-2 px-4 text-xs font-semibold text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 hover:bg-[var(--accent-teal-bg)] rounded-lg transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedProblems.map((problem) => (
                      <ProblemCard
                        key={problem.id}
                        problem={problem}
                        isSelected={selectedProblem.id === problem.id}
                        onSelect={handleSelectProblem}
                        onViewDossier={(p) => setDossierProblem(p)}
                        isBookmarked={bookmarkedIds.includes(problem.id)}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                ) : (
                  /* Table View for High-Density Scanning */
                  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-inner)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase font-mono tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Code / Authority</th>
                          <th className="py-3 px-4">Title & Context</th>
                          <th className="py-3 px-4">Sector</th>
                          <th className="py-3 px-4">Scope</th>
                          <th className="py-3 px-4">Exploring</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-main)]">
                        {paginatedProblems.map((p) => (
                          <tr
                            key={p.id}
                            className={`hover:bg-[var(--bg-inner)] transition-colors ${
                              selectedProblem.id === p.id ? 'bg-[var(--accent-teal-bg)]' : ''
                            }`}
                          >
                            <td className="py-3 px-4 font-mono whitespace-nowrap">
                              <div className="font-semibold text-[var(--accent-teal)]">{p.sourceCode}</div>
                              <div className="text-[11px] text-[var(--text-muted)]">{p.organization}</div>
                            </td>
                            <td className="py-3 px-4 max-w-md">
                              <div className="font-semibold text-[var(--text-heading)] leading-snug flex items-center gap-2 flex-wrap">
                                <span>{p.title}</span>
                                {p.semanticScore !== undefined && (
                                  <span className="text-[10px] font-mono font-bold text-[var(--accent-teal)] bg-[var(--accent-teal-bg)] px-1.5 py-0.5 rounded border border-[var(--accent-teal)]/30">
                                    ✨ {p.semanticScore}% Match
                                  </span>
                                )}
                              </div>
                              {p.relevanceReason ? (
                                <div className="text-[var(--accent-teal)] text-[11px] italic line-clamp-1 mt-0.5">
                                  AI: "{p.relevanceReason}"
                                </div>
                              ) : (
                                <div className="text-[var(--text-muted)] text-[11px] line-clamp-1 mt-0.5">{p.painPoint}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-medium">{p.sector}</td>
                            <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                              {p.estimatedHours}h · {p.difficulty}
                            </td>
                            <td className="py-3 px-4 font-mono tabular-nums text-[var(--accent-teal)] font-semibold whitespace-nowrap">
                              {p.exploringCount} teams
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                              <button
                                type="button"
                                onClick={() => setDossierProblem(p)}
                                className="py-1 px-2.5 text-xs text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-subtle)] rounded transition-colors cursor-pointer"
                              >
                                Dossier
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectProblem(p)}
                                className={`py-1 px-2.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                                  selectedProblem.id === p.id
                                    ? 'bg-[var(--accent-teal)] text-white font-bold'
                                    : 'bg-[var(--accent-teal-bg)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal)] hover:text-white'
                                }`}
                              >
                                {selectedProblem.id === p.id ? 'Selected' : 'Work on This'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Google-Style Bottom Pagination */}
                <GooglePagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  totalItems={totalFilteredCount}
                  pageSize={pageSize}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>
        )}

        {/* TAB 2: VALIDATE IDEA */}
        {activeTab === 'validate' && (
          <IdeaValidator
            selectedProblem={selectedProblem}
            teamSkills={teamSkills}
            setTeamSkills={setTeamSkills}
            availableHours={availableHours}
            setAvailableHours={setAvailableHours}
            ideaText={ideaText}
            setIdeaText={setIdeaText}
            validationResult={validationResult}
            setValidationResult={setValidationResult}
            onProceedToBrief={() => {
              setActiveTab('brief');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBrowseProblems={() => {
              setActiveTab('discover');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 3: GENERATE BRIEF */}
        {activeTab === 'brief' && (
          <BriefGenerator
            selectedProblem={selectedProblem}
            ideaText={ideaText}
            teamSkills={teamSkills}
            availableHours={availableHours}
            defaultTeamName={currentUser?.teamName || 'COGNIHUB'}
            defaultTeamId={currentUser?.teamId || 'DEX26297'}
            onBackToValidator={() => {
              setActiveTab('validate');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 4: DATABASE & API HUB */}
        {activeTab === 'database' && <DatabaseHub problems={problems} />}
      </main>

      {/* User-Friendly Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-xl bg-[var(--text-heading)] text-[var(--bg-app)] font-medium text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-card)] bg-[var(--bg-card)] py-6 px-6 mt-16 text-xs text-[var(--text-muted)] transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="font-bold text-[var(--text-heading)] tracking-wide">CRUX</span> · Problem Discovery & Novelty Validation Engine
            <span className="block text-[var(--text-muted)] mt-0.5">
              Team <strong className="text-[var(--text-main)]">COGNIHUB</strong> (Team ID: <code className="font-mono text-[var(--accent-teal)]">DEX26297</code>) · Theme: Open Innovation
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>Sathyabama Dexathon 2026</span>
            <span aria-hidden="true" className="opacity-40">|</span>
            <button
              type="button"
              onClick={() => setIsPitchOpen(true)}
              className="text-[var(--accent-amber)] hover:underline cursor-pointer font-medium"
            >
              1-Minute Elevator Pitch
            </button>
            <span aria-hidden="true" className="opacity-40">|</span>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="text-[var(--accent-teal)] hover:underline cursor-pointer font-medium"
            >
              + Submit Problem
            </button>
          </div>
        </div>
      </footer>

      {/* Dossier Modal */}
      <ProblemDetailModal
        problem={dossierProblem}
        onClose={() => setDossierProblem(null)}
        onSelectAndValidate={(p) => handleSelectProblem(p)}
      />

      {/* Share / Community Grievance Submission Modal */}
      <ShareProblemModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onProblemAdded={handleProblemAdded}
      />

      {/* Sathyabama Dexathon Pitch Modal */}
      <PitchModal isOpen={isPitchOpen} onClose={() => setIsPitchOpen(false)} />

      {/* Log In / Registration Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
