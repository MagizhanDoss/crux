/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProblemStatement, Skill } from '../types.ts';

interface BriefGeneratorProps {
  selectedProblem: ProblemStatement;
  ideaText: string;
  teamSkills: Skill[];
  availableHours: number;
  onBackToValidator: () => void;
  defaultTeamName?: string;
  defaultTeamId?: string;
}

export const BriefGenerator: React.FC<BriefGeneratorProps> = ({
  selectedProblem,
  ideaText,
  teamSkills,
  availableHours,
  onBackToValidator,
  defaultTeamName = 'COGNIHUB',
  defaultTeamId = 'DEX26297',
}) => {
  const [teamName, setTeamName] = useState(defaultTeamName);
  const [teamId, setTeamId] = useState(defaultTeamId);
  const [briefText, setBriefText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (defaultTeamName) setTeamName(defaultTeamName);
    if (defaultTeamId) setTeamId(defaultTeamId);
  }, [defaultTeamName, defaultTeamId]);

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: teamName,
          team_id: teamId,
          problem_id: selectedProblem.id,
          idea_summary: ideaText || 'Comprehensive, offline-first digital solution for field practitioners.',
          team_skills: teamSkills,
          available_hours: availableHours,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBriefText(data.brief);
      } else {
        throw new Error('Failed to generate brief');
      }
    } catch (err) {
      console.warn('Brief generator fallback:', err);
      setBriefText(`================================================================================
DEXATHON 2026: OFFICIAL PROBLEM STATEMENT BRIEF
Team Name: ${teamName} | Team ID: ${teamId}
Theme: Open Innovation | Category: Software
Host: Sathyabama Institute of Science and Technology
================================================================================

1. PROBLEM TITLE & SOURCE IDENTIFIER
Title: ${selectedProblem.title}
Reference: ${selectedProblem.sourceCode}
Issuing Authority: ${selectedProblem.organization} [${selectedProblem.sourceType}]
SDG Alignment: ${selectedProblem.sdgGoal}

2. THE ROOT PROBLEM & OPERATIONAL FRICTION
${selectedProblem.painPoint}

3. TARGET BENEFICIARIES & GEOGRAPHIC SETTING
Direct Beneficiaries: ${selectedProblem.beneficiaries}
Field Setting: ${selectedProblem.location}
Severity Rating: ${selectedProblem.impactSeverity}

4. PROPOSED SOLUTION & ARCHITECTURAL APPROACH
${ideaText || 'An integrated, responsive software/hardware system designed to eliminate manual intervention and data loss.'}
Target Tech Stack: ${selectedProblem.sampleTechStack.join(' • ')}

5. NOVELTY & COMPETITIVE DIFFERENTIATION
Baseline Trap Avoided: ${selectedProblem.baselineAttempts}
Crux Innovation Angle: ${selectedProblem.novelAngleOpportunity}

6. FEASIBILITY & ${availableHours}-HOUR SPRINT ROADMAP
Allocated Sprint Duration: ${availableHours} Hours
Team Technical Strengths: ${teamSkills.join(', ')}
• Phase 1 (Hours 0-10): Data pipeline, offline schemas, and core sensor/API mock.
• Phase 2 (Hours 10-24): Primary user workflow, inference/matching engine, and reactive UI.
• Phase 3 (Hours 24-${availableHours}): Edge cases, validation tests, exportable brief, and judge pitch deck.

7. VERIFIABLE EVIDENCE & PUBLIC DATA SOURCES
${selectedProblem.dataSources.map((ds) => `• ${ds}`).join('\n')}

Generated via Crux (Team COGNIHUB - DEX26297)
================================================================================`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrief();
  }, [selectedProblem.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([briefText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dexathon_Brief_${selectedProblem.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Metadata Configuration */}
      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[var(--text-heading)]">
              Submission-Ready Problem Brief
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Formatted for Dexathon 2026, Smart India Hackathon (SIH), and university project submission forms.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToValidator}
            className="py-1.5 px-3 text-xs font-semibold text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-card)] rounded-lg transition-colors cursor-pointer"
          >
            ← Back to Idea Validator
          </button>
        </div>

        {/* Team Details Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] text-xs focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
              Team ID / Registration No.
            </label>
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] text-xs focus:outline-none focus:border-[var(--accent-teal)] transition-colors font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            Active Problem: <strong className="text-[var(--text-heading)]">{selectedProblem.title}</strong>
          </span>
          <button
            type="button"
            onClick={fetchBrief}
            disabled={loading}
            className="py-1.5 px-3 text-xs font-medium text-[var(--accent-teal)] bg-[var(--accent-teal-bg)] border border-[var(--accent-teal-border)] hover:bg-[var(--accent-teal)] hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Re-generating...' : '↻ Refresh Brief'}
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs text-[var(--text-muted)]">
          Export options for jury review, slides, and hackathon registration portals.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2 px-3.5 text-xs font-semibold text-white bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            {copyFeedback ? '✓ Copied to Clipboard!' : '📋 Copy Text'}
          </button>

          <button
            type="button"
            onClick={handleDownloadMd}
            className="py-2 px-3.5 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] hover:opacity-80 border border-[var(--border-card)] rounded-lg transition-colors cursor-pointer"
          >
            💾 Download .md
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="py-2 px-3.5 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-card)] hover:opacity-80 border border-[var(--border-card)] rounded-lg transition-colors cursor-pointer"
          >
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      {/* Brief Document Container */}
      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl transition-colors">
        {loading ? (
          <div className="py-16 text-center text-[var(--text-muted)] text-sm space-y-2">
            <div className="animate-spin text-[var(--accent-teal)] text-2xl">⚙</div>
            <div>Drafting comprehensive, judges-ready problem brief...</div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--text-main)] leading-relaxed overflow-x-auto select-all p-4 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
            {briefText}
          </pre>
        )}
      </div>
    </div>
  );
};
