/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--accent-amber)]/40 rounded-2xl p-6 sm:p-7 shadow-2xl text-[var(--text-main)] transition-colors">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
          <div>
            <div className="text-xs font-mono text-[var(--accent-amber)] font-semibold mb-0.5">
              TEAM COGNIHUB · DEX26297 · SATHYABAMA DEXATHON 2026
            </div>
            <h2 className="font-serif text-2xl font-bold text-[var(--text-heading)]">
              Pitch Deck Script & Judge Defense Cheat Sheet
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-heading)] text-2xl p-1 cursor-pointer leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="space-y-5 text-xs text-[var(--text-main)] leading-relaxed">
          {/* 1-Minute Pitch Script */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-amber)] mb-2 flex items-center gap-1.5">
              <span>🎤 The 1-Minute Elevator Pitch (Memorize for the Stage)</span>
            </h3>
            <div className="space-y-2 text-[var(--text-main)] italic font-serif text-sm">
              <p>
                &ldquo;Respected judges and fellow innovators, we are team <strong>COGNIHUB</strong>, and our project is <strong>Crux</strong>.&rdquo;
              </p>
              <p>
                &ldquo;Every student hackathon begins the exact same way: a disorganized WhatsApp chat, five half-baked ideas, and days lost arguing over what to build. Students don&apos;t know where real problems live, they can&apos;t tell if their idea is already solved, and they can&apos;t tell if they can finish it in time.&rdquo;
              </p>
              <p>
                &ldquo;Meanwhile, clinics, farmers, and municipal offices have urgent ground problems they cannot solve alone. <strong>Crux bridges this gap.</strong>&rdquo;
              </p>
              <p>
                &ldquo;It works in 5 streamlined parts: <strong>Discover</strong> streams verified problem statements from Smart India Hackathon (SIH), open government data (data.gov.in), and citizen grievances. <strong>Choose</strong> lets teams filter by sector and geography. <strong>Score</strong> and <strong>Match</strong> rate originality and finishability against past clones for your team&apos;s exact tech stack and sprint hours. And <strong>Brief</strong> outputs a submission-ready executive one-pager.&rdquo;
              </p>
              <p>
                &ldquo;Crux ensures every team starts from an evidence-backed need, and every real problem finds motivated builders. Thank you!&rdquo;
              </p>
            </div>
          </div>

          {/* Technical Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-teal)] mb-2">
              Technical Architecture (Slide 4 Defense)
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-medium">Front-End</div>
                <div className="text-[var(--text-heading)] font-mono font-semibold">React + Tailwind + Dual Theme</div>
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-medium">Back-End</div>
                <div className="text-[var(--text-heading)] font-mono font-semibold">Express + TypeScript / Node</div>
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-medium">AI & Similarity Search</div>
                <div className="text-[var(--text-heading)] font-mono font-semibold">Gemini 3.8 Flash & Vector Matrix</div>
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-medium">Data Storage</div>
                <div className="text-[var(--text-heading)] font-mono font-semibold">JSON Flatfile / PostgreSQL Ready</div>
              </div>
            </div>
          </div>

          {/* Anticipated Judge Questions & Defenses */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] mb-2">
              Anticipated Jury Q&A & Rebuttals
            </h3>
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="font-semibold text-[var(--accent-amber)] mb-1">
                  Q: &ldquo;Isn&apos;t this just a hackathon topic generator?&rdquo;
                </div>
                <p className="text-[var(--text-main)]">
                  <strong>A:</strong> &ldquo;No! Generic topic generators spit out hypothetical buzzword prompts like &lsquo;AI for Healthcare&rsquo;. Crux operates on <em>real evidence</em>: actual ministry codes from Smart India Hackathon, citizen grievance tickets from CPGRAMS, and open datasets from data.gov.in. It tells teams whether their idea is a clone of a past project and whether it can realistically be built in 36 hours.&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="font-semibold text-[var(--accent-amber)] mb-1">
                  Q: &ldquo;How does the business model work after the hackathon?&rdquo;
                </div>
                <p className="text-[var(--text-main)]">
                  <strong>A:</strong> &ldquo;Crux is free for students and grassroots NGOs. We monetize through B2B institutional licenses for colleges and hackathon organizers (like Sathyabama, AICTE, and incubators) who need private problem statement feeds, duplicate detection for student submissions, and progress monitoring dashboards.&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                <div className="font-semibold text-[var(--accent-amber)] mb-1">
                  Q: &ldquo;How do you prevent spam or fake problem posts?&rdquo;
                </div>
                <p className="text-[var(--text-main)]">
                  <strong>A:</strong> &ldquo;Every problem carries a provenance badge: Verified Official (SIH/CPGRAMS), Citizen Verified, or Peer Reviewed. Unverified submissions go through an automated entity check and require community upvotes before joining the primary discovery feed.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)] mt-5">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 text-xs font-bold text-white bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            Got it, Let&apos;s Pitch! →
          </button>
        </div>
      </div>
    </div>
  );
};
