/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProblemStatement } from '../types.ts';

interface ProblemDetailModalProps {
  problem: ProblemStatement | null;
  onClose: () => void;
  onSelectAndValidate: (problem: ProblemStatement) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problem,
  onClose,
  onSelectAndValidate,
}) => {
  if (!problem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 sm:p-7 shadow-2xl text-[var(--text-main)] transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1.5 flex-wrap">
              <span className="font-semibold text-[var(--accent-teal)]">{problem.sector}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span className="font-mono">{problem.sourceCode}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span>{problem.sourceType}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span className="text-[var(--text-main)]">{problem.sdgGoal}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[var(--text-heading)] tracking-tight leading-snug">
              {problem.title}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Issuing Organization: <span className="text-[var(--text-main)] font-semibold">{problem.organization}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-heading)] text-2xl p-1 cursor-pointer leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Ground Reality & Pain Point */}
        <div className="space-y-5 text-sm">
          {problem.semanticScore !== undefined && (
            <div className="p-4 rounded-xl bg-[var(--accent-teal-bg)] border border-[var(--accent-teal)]/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--accent-teal)] flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Gemini Semantic Match Breakdown</span>
                </span>
                <span className="font-mono font-bold text-[var(--accent-teal)]">
                  {problem.semanticScore}% Semantic Resonance
                </span>
              </div>
              {problem.relevanceReason && (
                <p className="text-xs text-[var(--text-main)] italic leading-relaxed">
                  "{problem.relevanceReason}"
                </p>
              )}
              {problem.suggestedAngles && problem.suggestedAngles.length > 0 && (
                <div className="pt-2 border-t border-[var(--accent-teal)]/20 text-xs">
                  <span className="font-semibold text-[var(--text-heading)] block mb-1">
                    AI Suggested Hackathon Angles:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[var(--text-main)] opacity-90 pl-1">
                    {problem.suggestedAngles.map((angle, i) => (
                      <li key={i}>{angle}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--accent-teal)] mb-2">
              01. The Ground Reality & Operational Bottleneck
            </h4>
            <p className="text-[var(--text-main)] leading-relaxed bg-[var(--bg-inner)] p-4 rounded-xl border border-[var(--border-subtle)]">
              {problem.painPoint}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-inner)] p-4 rounded-xl border border-[var(--border-subtle)]">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5">
                Target Beneficiaries
              </h4>
              <p className="text-[var(--text-main)] font-medium">{problem.beneficiaries}</p>
              <div className="text-xs text-[var(--text-muted)] mt-2">
                Field Setting: <span className="text-[var(--text-heading)]">{problem.location}</span>
              </div>
            </div>

            <div className="bg-[var(--bg-inner)] p-4 rounded-xl border border-[var(--border-subtle)]">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5">
                Hackathon Sprint Parameters
              </h4>
              <div className="space-y-1 font-mono text-xs tabular-nums text-[var(--text-muted)]">
                <div>Sprint Duration: <span className="text-[var(--accent-teal)] font-bold">{problem.estimatedHours} Hours</span></div>
                <div>Difficulty: <span className="text-[var(--text-heading)] font-semibold">{problem.difficulty}</span></div>
                <div>Track: <span className="text-[var(--text-heading)]">{problem.hackathonTrack}</span></div>
                <div>Active Teams: <span className="text-[var(--accent-teal)] font-semibold">{problem.exploringCount} exploring</span></div>
              </div>
            </div>
          </div>

          {/* Pitfall vs Innovation */}
          <div className="border border-[var(--border-card)] rounded-xl overflow-hidden">
            <div className="bg-rose-500/10 border-b border-[var(--border-subtle)] p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-500 mb-1">
                ⚠️ Common Hackathon Trap (What Naive Teams Build)
              </div>
              <p className="text-xs text-[var(--text-main)] leading-relaxed">
                {problem.baselineAttempts}
              </p>
            </div>

            <div className="bg-[var(--accent-teal-bg)] p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-teal)] mb-1">
                💡 High-Scoring Novel Angle (What Wins)
              </div>
              <p className="text-xs text-[var(--text-heading)] leading-relaxed font-medium">
                {problem.novelAngleOpportunity}
              </p>
            </div>
          </div>

          {/* Past Clones to Differentiate Against */}
          {problem.pastClones && problem.pastClones.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
                02. Past Hackathon Prior Art (Differentiate Here)
              </h4>
              <div className="space-y-2">
                {problem.pastClones.map((clone, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-xs"
                  >
                    <div className="font-semibold text-[var(--accent-amber)] mb-0.5">{clone.name}</div>
                    <div className="text-[var(--text-muted)] mb-1">
                      Limitation: <span className="text-[var(--text-main)]">{clone.limitation}</span>
                    </div>
                    <div className="text-[var(--text-muted)] font-mono text-[11px] opacity-80">
                      Trigger Keywords: {clone.keywords.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verifiable Data Sources & Citations */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
              03. Public Government Datasets & APIs
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-main)]">
              {problem.dataSources.map((ds, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-[var(--accent-teal)] font-bold">→</span>
                  <span>{ds}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Tech Stack */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
              04. Recommended Technical Implementation
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {problem.sampleTechStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-[var(--accent-teal-bg)] text-[var(--accent-teal)] border border-[var(--accent-teal-border)] font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectAndValidate(problem);
              onClose();
            }}
            className="py-2.5 px-5 text-xs font-bold text-white bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer shadow-md"
          >
            Take on this Problem Statement →
          </button>
        </div>
      </div>
    </div>
  );
};
