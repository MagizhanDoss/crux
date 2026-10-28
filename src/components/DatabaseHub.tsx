/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DatabaseStats, ProblemStatement } from '../types.ts';

interface DatabaseHubProps {
  problems: ProblemStatement[];
}

export const DatabaseHub: React.FC<DatabaseHubProps> = ({ problems }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'api' | 'schema' | 'raw'>('overview');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/problems?sector=Agriculture');
  const [loadingApi, setLoadingApi] = useState(false);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, [problems.length]);

  const runApiTest = async (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setLoadingApi(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoadingApi(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'api') {
      runApiTest(selectedEndpoint);
    }
  }, [activeSubTab]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs text-[var(--accent-teal)] font-semibold mb-1">
              OPEN GOVERNMENT DATA & SIH REPOSITORY
            </div>
            <h2 className="font-serif text-2xl font-bold text-[var(--text-heading)]">
              Database Hub & High-Level Integration
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              Curated repository of real-world problem statements from Smart India Hackathon (SIH), CPGRAMS citizen grievances, and Open Government Data (data.gov.in). Built for researchers, hackathon organisers, and institutional incubators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/database/export?format=json"
              download="crux_problems_database.json"
              className="py-2 px-3.5 text-xs font-semibold text-white bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              📥 Export JSON
            </a>
            <a
              href="/api/database/export?format=csv"
              download="crux_problems_database.csv"
              className="py-2 px-3.5 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-card)] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              📊 Export CSV
            </a>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-4 border-t border-[var(--border-subtle)] pt-4 text-xs font-medium text-[var(--text-muted)] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`pb-1 cursor-pointer transition-colors whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)]'
                : 'hover:text-[var(--text-heading)]'
            }`}
          >
            Analytics & Distribution
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('api')}
            className={`pb-1 cursor-pointer transition-colors whitespace-nowrap ${
              activeSubTab === 'api'
                ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)]'
                : 'hover:text-[var(--text-heading)]'
            }`}
          >
            REST API Explorer
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('schema')}
            className={`pb-1 cursor-pointer transition-colors whitespace-nowrap ${
              activeSubTab === 'schema'
                ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)]'
                : 'hover:text-[var(--text-heading)]'
            }`}
          >
            Data Schema Specification
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('raw')}
            className={`pb-1 cursor-pointer transition-colors whitespace-nowrap ${
              activeSubTab === 'raw'
                ? 'text-[var(--accent-teal)] font-semibold border-b-2 border-[var(--accent-teal)]'
                : 'hover:text-[var(--text-heading)]'
            }`}
          >
            Raw JSON Records ({problems.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: OVERVIEW & STATS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
              <span className="text-xs text-[var(--text-muted)] block mb-1">Total Problem Statements</span>
              <span className="font-mono text-2xl font-bold text-[var(--text-heading)] tabular-nums">
                {problems.length}
              </span>
              <span className="text-[11px] text-[var(--accent-teal)] block mt-1">SIH, CPGRAMS & Open Data</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
              <span className="text-xs text-[var(--text-muted)] block mb-1">Active Exploring Teams</span>
              <span className="font-mono text-2xl font-bold text-[var(--accent-teal)] tabular-nums">
                {stats?.total_exploring_teams || problems.reduce((acc, p) => acc + (p.exploringCount || 0), 0)}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block mt-1">Student Builders</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
              <span className="text-xs text-[var(--text-muted)] block mb-1">Verified Ministries & Bodies</span>
              <span className="font-mono text-2xl font-bold text-[var(--accent-amber)] tabular-nums">
                12
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block mt-1">Official Authorities</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
              <span className="text-xs text-[var(--text-muted)] block mb-1">Aligned UN SDGs</span>
              <span className="font-mono text-2xl font-bold text-[var(--text-heading)] tabular-nums">
                8 Goals
              </span>
              <span className="text-[11px] text-[var(--accent-teal)] block mt-1">SDG 1, 2, 3, 4, 6, 7, 11, 13</span>
            </div>
          </div>

          {/* Sector Breakdown */}
          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[var(--text-heading)] mb-4">
              Sectoral Distribution of Problems
            </h3>
            <div className="space-y-3">
              {Object.entries(
                stats?.sector_distribution ||
                  problems.reduce((acc: any, p) => {
                    acc[p.sector] = (acc[p.sector] || 0) + 1;
                    return acc;
                  }, {})
              ).map(([sec, count]) => {
                const total = problems.length || 1;
                const pct = Math.round(((count as number) / total) * 100);
                return (
                  <div key={sec} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-[var(--text-main)]">
                      <span>{sec}</span>
                      <span className="font-mono tabular-nums text-[var(--text-muted)]">
                        {count as number} problems ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg-inner)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-teal)] rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source Authorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
              <h3 className="font-serif text-base font-bold text-[var(--text-heading)] mb-3">
                Authority & Provenance Breakdown
              </h3>
              <div className="space-y-2 text-xs text-[var(--text-main)]">
                <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex justify-between">
                  <span>Smart India Hackathon (SIH Ministry Feeds)</span>
                  <span className="font-mono text-[var(--accent-teal)] font-bold">Official PS</span>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex justify-between">
                  <span>CPGRAMS (DARPG Citizen Grievance Dossiers)</span>
                  <span className="font-mono text-[var(--accent-amber)] font-bold">Public Complaints</span>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex justify-between">
                  <span>Open Government Data Platform (data.gov.in)</span>
                  <span className="font-mono text-[var(--text-heading)] font-bold">Open Datasets</span>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex justify-between">
                  <span>Grassroots PHCs, FPOs & Panchayats</span>
                  <span className="font-mono text-[var(--text-muted)] font-bold">Field Verified</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
              <h3 className="font-serif text-base font-bold text-[var(--text-heading)] mb-3">
                High-Level Ecosystem Use Cases
              </h3>
              <ul className="space-y-2 text-xs text-[var(--text-main)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-teal)] font-bold">→</span>
                  <span><strong>University Hackathons:</strong> Direct syndicate feed to prevent duplicate or toy project submissions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-teal)] font-bold">→</span>
                  <span><strong>College R&D Incubators:</strong> Seed genuine citizen pain points for final-year engineering capstone projects.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent-teal)] font-bold">→</span>
                  <span><strong>NGOs & Municipalities:</strong> Direct crowd-sourcing portal to receive student assistance without costly IT tenders.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: REST API EXPLORER */}
      {activeSubTab === 'api' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[var(--text-heading)]">
              Interactive REST Endpoints
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Select an endpoint to test live responses from the Express engine:
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {['/api/problems', '/api/problems?sector=Agriculture', '/api/problems/SIH-2024-AG-1422', '/api/stats', '/api/health'].map((ep) => (
                <button
                  key={ep}
                  type="button"
                  onClick={() => runApiTest(ep)}
                  className={`py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                    selectedEndpoint === ep
                      ? 'bg-[var(--accent-teal-bg)] border-[var(--accent-teal)] text-[var(--accent-teal)] font-bold'
                      : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                  }`}
                >
                  GET {ep}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>Endpoint: <span className="text-[var(--accent-teal)]">{selectedEndpoint}</span></span>
              {loadingApi && <span className="text-[var(--accent-amber)] animate-pulse">Fetching...</span>}
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--text-main)] bg-[var(--bg-inner)] p-4 rounded-lg border border-[var(--border-subtle)] max-h-96 overflow-y-auto">
              {apiResponse || '// Click any endpoint above to test output'}
            </pre>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SCHEMA SPECIFICATION */}
      {activeSubTab === 'schema' && (
        <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[var(--text-heading)]">
            Data Schema Specification (TypeScript / JSON)
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            For academic researchers, municipal bodies, and student syndicates looking to submit or ingest problem statements:
          </p>
          <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--accent-teal)] bg-[var(--bg-inner)] p-4 rounded-lg border border-[var(--border-subtle)] overflow-x-auto">
{`interface ProblemStatement {
  id: string;                         // e.g. "SIH-2024-AG-1422" or "CPGRAMS-DL-8821"
  title: string;                      // Problem Statement Title
  organization: string;               // Ministry, Department, or Field NGO
  sourceType:                         // Authority category
    | 'Smart India Hackathon (SIH)'
    | 'CPGRAMS (Citizen Grievances)'
    | 'data.gov.in (Open Gov Data)'
    | 'Grassroots / Community';
  sourceCode: string;                 // e.g. "SIH2024-PS-1422"
  sector:                             // Standard taxonomy
    | 'Agriculture'
    | 'Healthcare'
    | 'Civic & Transport'
    | 'Water & Sanitation'
    | 'Education & Skilling'
    | 'Clean Energy & Climate'
    | 'Governance & PDS'
    | 'Small Business & Trade';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Research Track';
  location: string;                   // Geographic context & field setting
  painPoint: string;                  // Operational ground friction
  beneficiaries: string;              // Target citizens or workers affected
  impactSeverity: 'Critical' | 'High' | 'Medium';
  suggestedSkills: ('web' | 'app' | 'ai' | 'data' | 'ece' | 'design')[];
  estimatedHours: number;             // 24, 36 (Dexathon), or 48 hours
  sdgGoal: string;                    // e.g. "SDG 2: Zero Hunger"
  baselineAttempts: string;           // Common naive hackathon traps
  novelAngleOpportunity: string;      // Award-winning differentiation angle
  pastClones: {                       // Prior art for similarity detection
    name: string;
    keywords: string[];
    limitation: string;
  }[];
  dataSources: string[];              // Open datasets and public APIs
  verificationStatus: 'Verified Official' | 'Citizen Verified' | 'Peer Reviewed';
  exploringCount: number;             // Real-time counter of teams exploring
  sampleTechStack: string[];          // Feasible reference technologies
}`}
          </pre>
        </div>
      )}

      {/* SUBTAB 4: RAW JSON RECORDS */}
      {activeSubTab === 'raw' && (
        <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[var(--text-heading)]">
              Raw Database Records ({problems.length} Problem Statements)
            </h3>
            <span className="text-xs font-mono text-[var(--text-muted)]">data/problems.json</span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--text-main)] bg-[var(--bg-inner)] p-4 rounded-lg border border-[var(--border-subtle)] max-h-96 overflow-y-auto">
            {JSON.stringify(problems, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
