/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProblemStatement, Sector, Skill } from '../types.ts';

interface ShareProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemAdded: (problem: ProblemStatement) => void;
}

type ConcreteSector = ProblemStatement['sector'];

export const ShareProblemModal: React.FC<ShareProblemModalProps> = ({
  isOpen,
  onClose,
  onProblemAdded,
}) => {
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState<ConcreteSector>('Agriculture');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !painPoint.trim() || !beneficiaries.trim()) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      title: title.trim(),
      sector,
      organization: organization.trim() || 'Community Grievance / Field Contributor',
      location: location.trim() || 'Field Context',
      painPoint: painPoint.trim(),
      beneficiaries: beneficiaries.trim(),
      sourceType: 'Grassroots / Community',
      sourceCode: `COMM-${Date.now().toString(36).toUpperCase()}`,
      suggestedSkills: ['web', 'data'] as Skill[],
      estimatedHours: 36,
      difficulty,
    };

    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        onProblemAdded(created);
        onClose();
      } else {
        throw new Error('Failed to submit problem');
      }
    } catch (err: any) {
      console.warn('Backend submission error, adding locally:', err);
      const fallback: ProblemStatement = {
        id: `COMM-${Date.now()}`,
        title: payload.title,
        organization: payload.organization,
        sourceType: 'Grassroots / Community',
        sourceCode: payload.sourceCode,
        sector: payload.sector,
        difficulty: payload.difficulty,
        location: payload.location,
        painPoint: payload.painPoint,
        beneficiaries: payload.beneficiaries,
        impactSeverity: 'High',
        suggestedSkills: payload.suggestedSkills,
        hackathonTrack: 'Open Innovation',
        estimatedHours: 36,
        sdgGoal: 'SDG 11: Sustainable Communities',
        baselineAttempts: 'Manual spreadsheets and paper grievance logs.',
        novelAngleOpportunity: 'Streamlined localized digital interface with offline telemetry.',
        pastClones: [],
        dataSources: ['Direct Field Submissions'],
        verificationStatus: 'Citizen Verified',
        exploringCount: 1,
        sampleTechStack: ['React', 'Express / Node', 'Tailwind CSS'],
      };
      onProblemAdded(fallback);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 shadow-2xl text-[var(--text-main)] transition-colors">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[var(--text-heading)]">
              Submit a Real-World Problem Statement
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Experienced an operational challenge in a clinic, rural farm, panchayat, or municipal ward? Post it here for student builders.
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

        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-heading)] mb-1">
              Problem Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Primary health centre rabies vaccine stockout alert delay"
              className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-heading)] mb-1">
                Sector *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as ConcreteSector)}
                className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              >
                <option value="Agriculture">Agriculture</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Civic & Transport">Civic & Transport</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Education & Skilling">Education & Skilling</option>
                <option value="Clean Energy & Climate">Clean Energy & Climate</option>
                <option value="Governance & PDS">Governance & PDS</option>
                <option value="Small Business & Trade">Small Business & Trade</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-heading)] mb-1">
                Scope / Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              >
                <option value="Beginner">Beginner (24h)</option>
                <option value="Intermediate">Intermediate (36h)</option>
                <option value="Advanced">Advanced (48h)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-heading)] mb-1">
                Organization / Department
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. PHC Thanjavur / Cauvery FPO"
                className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-heading)] mb-1">
                Location & Context *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rural taluks of Tamil Nadu"
                className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-heading)] mb-1">
              Core Pain Point (What fails today?) *
            </label>
            <textarea
              required
              rows={3}
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              placeholder="Describe the operational friction, why existing systems fail, and the impact on people..."
              className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-heading)] mb-1">
              Target Beneficiaries (Who is directly affected?) *
            </label>
            <input
              type="text"
              required
              value={beneficiaries}
              onChange={(e) => setBeneficiaries(e.target.value)}
              placeholder="e.g. Smallholder farmers, rural pregnant mothers, street vendors"
              className="w-full p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-4 text-white font-bold bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Problem Statement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
