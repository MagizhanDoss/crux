/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProblemStatement } from '../types.ts';

interface ProblemCardProps {
  problem: ProblemStatement;
  isSelected: boolean;
  onSelect: (problem: ProblemStatement) => void;
  onViewDossier: (problem: ProblemStatement) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  isSelected,
  onSelect,
  onViewDossier,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <article
      className={`flex flex-col p-6 rounded-xl bg-[var(--bg-card)] border transition-all duration-150 ${
        isSelected
          ? 'border-[var(--accent-teal)] ring-1 ring-[var(--accent-teal)] shadow-lg shadow-teal-500/10'
          : 'border-[var(--border-card)] hover:border-[var(--accent-teal)]/60'
      }`}
    >
      {/* Zero-Pill Unboxed Metadata Kicker */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[var(--accent-teal)]">{problem.sector}</span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span className="font-mono">{problem.sourceCode}</span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span className="truncate max-w-[140px]">{problem.location}</span>
        </div>
        <button
          type="button"
          onClick={() => onToggleBookmark(problem.id)}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this problem'}
          className="text-slate-400 hover:text-amber-400 cursor-pointer p-1 transition-colors text-base"
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>

      {/* Semantic AI Match Badge (if present) */}
      {problem.semanticScore !== undefined && (
        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-[var(--accent-teal-bg)] border border-[var(--accent-teal)]/30 flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--accent-teal)] flex items-center gap-1.5">
            <span>✨</span>
            <span className="truncate max-w-[200px]">{problem.matchingTheme || 'Semantic Match'}</span>
          </span>
          <span className="font-mono font-bold text-[var(--accent-teal)]">
            {problem.semanticScore}% match
          </span>
        </div>
      )}

      {/* Problem Title */}
      <h3 className="font-serif text-xl font-bold text-[var(--text-heading)] tracking-tight leading-snug mb-2">
        {problem.title}
      </h3>

      {/* Organization / Ministry Attribution */}
      <p className="text-xs text-[var(--text-muted)] mb-3 font-medium">
        Issuing Body: <span className="text-[var(--text-main)] font-semibold">{problem.organization}</span>
      </p>

      {/* AI Semantic Rationale (if semantic search active) */}
      {problem.relevanceReason && (
        <div className="mb-3 p-2.5 rounded-lg bg-[var(--bg-inner)] border-l-2 border-[var(--accent-teal)] text-xs text-[var(--text-main)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-teal)] font-bold mb-0.5">
            AI Semantic Insight
          </div>
          <p className="leading-snug italic opacity-95">"{problem.relevanceReason}"</p>
        </div>
      )}

      {/* Ground Pain Point */}
      <p className="text-sm text-[var(--text-main)] leading-relaxed line-clamp-3 mb-4 opacity-90">
        {problem.painPoint}
      </p>

      {/* Target Beneficiaries */}
      <div className="text-xs text-[var(--text-muted)] mb-4 bg-[var(--bg-inner)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
        <span className="font-semibold text-[var(--text-main)]">Affects:</span> {problem.beneficiaries}
      </div>

      {/* Novel Opportunity Highlight */}
      <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] mb-4">
        <div className="text-xs text-[var(--text-muted)] mb-1">
          <span className="text-[var(--accent-teal)] font-semibold">Novel Angle:</span>{' '}
          <span className="text-[var(--text-main)]">{problem.novelAngleOpportunity}</span>
        </div>
      </div>

      {/* Bottom Metadata & Actions */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)] mb-4">
        <div className="flex items-center gap-2 font-mono tabular-nums">
          <span>{problem.estimatedHours}h sprint</span>
          <span aria-hidden="true">·</span>
          <span className="text-[var(--accent-teal)] font-semibold">{problem.exploringCount} teams exploring</span>
        </div>
        <span className="font-medium text-[var(--text-muted)]">{problem.difficulty}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(problem)}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
            isSelected
              ? 'bg-[var(--accent-teal)] text-slate-950 font-bold shadow-sm'
              : 'bg-[var(--accent-teal-bg)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal)] hover:text-white'
          }`}
        >
          {isSelected ? '✓ Selected to Solve' : 'Select Problem'}
        </button>

        <button
          type="button"
          onClick={() => onViewDossier(problem)}
          className="py-2 px-3 text-xs font-medium text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-card)] rounded-lg transition-colors cursor-pointer"
        >
          View Dossier
        </button>
      </div>
    </article>
  );
};
