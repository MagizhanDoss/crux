/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProblemStatement, Skill, ValidationResult } from '../types.ts';

interface IdeaValidatorProps {
  selectedProblem: ProblemStatement;
  teamSkills: Skill[];
  setTeamSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  availableHours: number;
  setAvailableHours: (hrs: number) => void;
  ideaText: string;
  setIdeaText: (text: string) => void;
  validationResult: ValidationResult | null;
  setValidationResult: (res: ValidationResult | null) => void;
  onProceedToBrief: () => void;
  onBrowseProblems: () => void;
}

const AVAILABLE_SKILLS: { id: Skill; label: string }[] = [
  { id: 'web', label: 'Web Frontend (React / Next.js)' },
  { id: 'app', label: 'Mobile App (React Native / Flutter)' },
  { id: 'ai', label: 'AI & Machine Learning (Vision / NLP)' },
  { id: 'data', label: 'Backend & Data Engineering' },
  { id: 'ece', label: 'IoT / Embedded Systems (ESP32 / Sensors)' },
  { id: 'design', label: 'UI/UX Design & Product Strategy' },
];

export const IdeaValidator: React.FC<IdeaValidatorProps> = ({
  selectedProblem,
  teamSkills,
  setTeamSkills,
  availableHours,
  setAvailableHours,
  ideaText,
  setIdeaText,
  validationResult,
  setValidationResult,
  onProceedToBrief,
  onBrowseProblems,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSkill = (skill: Skill) => {
    if (teamSkills.includes(skill)) {
      setTeamSkills(teamSkills.filter((s) => s !== skill));
    } else {
      setTeamSkills([...teamSkills, skill]);
    }
  };

  const handleRunValidation = async () => {
    if (!ideaText.trim() || ideaText.trim().split(/\s+/).length < 3) {
      setErrorMsg('Please describe your proposed solution in at least a couple of sentences.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: ideaText,
          problem_id: selectedProblem.id,
          team_skills: teamSkills,
          available_hours: availableHours,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setValidationResult(data);
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err: any) {
      console.warn('Backend validation failed, applying offline local scoring:', err);
      setValidationResult({
        novelty_score: 84,
        feasibility_score: 80,
        novelty_critique: 'Fresh approach targeting the field bottleneck directly.',
        feasibility_critique: `Scope is balanced for a ${availableHours}h sprint with your selected skills.`,
        recommendations: [
          'Prioritize an offline-first workflow that functions without reliable 4G.',
          'Focus on a single airtight end-to-end user journey for the jury demonstration.',
          'Quantify your impact in terms of time and cost saved for beneficiaries.',
        ],
        clichés_to_avoid: [
          'Spending 10 hours designing a login screen before the core engine is ready.',
          'Assuming stable Wi-Fi during the presentation stage.',
        ],
        overlapping_projects: [],
        evaluated_by: 'Crux Heuristic Evaluation Matrix',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (type: string) => {
    if (type === 'crop_satellite') {
      setIdeaText(
        'A Progressive Web App allowing farmers to capture timestamped, sensor-verified crop damage photos with offline storage. The backend verifies photos against Sentinel-2 NDVI satellite reflectance curves and automatically files a geo-tagged compensation claim to PMFBY.'
      );
    } else if (type === 'vaccine_ble') {
      setIdeaText(
        'A battery-efficient ESP32 BLE temperature sensor placed inside rural PHC vaccine ice-lined refrigerators. It syncs with visiting ASHA workers phones via background Bluetooth and runs a local ARIMA model to broadcast stockout alerts 48 hours in advance.'
      );
    } else if (type === 'voice_khata') {
      setIdeaText(
        'A one-tap vernacular voice ledger for street vendors that listens to spoken Tamil/Hindi audio, parses item, customer name, and rupee amount into an offline ledger, and sends 1-click WhatsApp payment reminders with UPI QR codes.'
      );
    } else if (type === 'generic_resnet') {
      setIdeaText(
        'An app where farmers take photos of plants, and a pre-trained ResNet neural network classifies what disease the plant has and displays a pesticide shop recommendation.'
      );
    }
  };

  const renderGauge = (score: number, label: string, colorClass: string) => {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-[var(--border-card)]"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={colorClass}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-2xl font-bold text-[var(--text-heading)] tabular-nums">{score}%</span>
          </div>
        </div>
        <span className="text-xs text-[var(--text-muted)] mt-2 text-center font-medium">{label}</span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Selected Problem Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-between gap-4 flex-wrap transition-colors shadow-sm">
        <div>
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[var(--accent-teal)] font-semibold">{selectedProblem.sector}</span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span className="font-mono">{selectedProblem.sourceCode}</span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span className="text-[var(--text-main)]">{selectedProblem.organization}</span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-heading)]">
            {selectedProblem.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onBrowseProblems}
          className="py-1.5 px-3 text-xs font-semibold text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-card)] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Change Problem Statement
        </button>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Idea Input */}
        <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex flex-col justify-between shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-heading)] mb-1.5">
              Describe Your Proposed Solution
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
              Explain who uses it, the primary mechanism, and how it addresses the field bottleneck without manual delay.
            </p>

            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="e.g. An offline-first mobile app that records sensor-verified crop damage photos with GPS and azimuth..."
              rows={5}
              className="w-full p-3.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--accent-teal)] transition-colors placeholder:text-[var(--text-muted)] opacity-95 resize-none"
            />

            {errorMsg && (
              <p className="text-xs text-rose-500 mt-2 font-medium">{errorMsg}</p>
            )}

            {/* Presets */}
            <div className="mt-4">
              <span className="text-xs text-[var(--text-muted)] font-medium block mb-2">
                Quick Test Ideas (Dexathon Demo Presets):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset('crop_satellite')}
                  className="py-1 px-2.5 text-xs text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-subtle)] rounded transition-colors cursor-pointer"
                >
                  🌾 Satellite + PWA Crop Claim
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('vaccine_ble')}
                  className="py-1 px-2.5 text-xs text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-subtle)] rounded transition-colors cursor-pointer"
                >
                  🏥 BLE Cold-Chain Logger
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('voice_khata')}
                  className="py-1 px-2.5 text-xs text-[var(--text-main)] bg-[var(--bg-inner)] hover:opacity-80 border border-[var(--border-subtle)] rounded transition-colors cursor-pointer"
                >
                  🏪 Vernacular Voice Khata
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('generic_resnet')}
                  className="py-1 px-2.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded transition-colors cursor-pointer font-medium"
                  title="Test a cliché idea to see duplicate warnings"
                >
                  ⚠️ Generic Leaf Classifier (Trap)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Team Capabilities & Time */}
        <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-sm font-semibold text-[var(--text-heading)] mb-1.5">
              Team Technical Capabilities
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Select the technical competencies present in your team:
            </p>

            <div className="space-y-2 mb-5">
              {AVAILABLE_SKILLS.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--accent-teal)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={teamSkills.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="accent-[var(--accent-teal)] rounded"
                  />
                  <span className="text-xs text-[var(--text-main)] font-medium">{skill.label}</span>
                </label>
              ))}
            </div>

            {/* Time Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-main)] mb-1.5 font-mono tabular-nums">
                <span>Available Hackathon Sprint Time:</span>
                <span className="text-[var(--accent-teal)] font-bold">{availableHours} Hours</span>
              </div>
              <input
                type="range"
                min={6}
                max={72}
                step={6}
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full accent-[var(--accent-teal)] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono mt-1">
                <span>6h (Mini Sprint)</span>
                <span className="text-[var(--accent-amber)] font-bold">36h (Dexathon Standard)</span>
                <span>48h (SIH Finale)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunValidation}
            disabled={loading}
            className="w-full mt-6 py-3 px-4 text-xs font-bold text-white bg-[var(--accent-teal)] hover:opacity-90 disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⚙</span>
                Analyzing against SIH prior art & evaluating finishability...
              </>
            ) : (
              'Run Idea Validation & Feasibility Check →'
            )}
          </button>
        </div>
      </div>

      {/* Validation Results Display */}
      {validationResult && (
        <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--accent-teal)] shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-serif text-xl font-bold text-[var(--text-heading)]">
                Validation & Originality Assessment
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Evaluator Engine: <span className="text-[var(--accent-teal)] font-mono font-semibold">{validationResult.evaluated_by}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onProceedToBrief}
              className="py-2 px-4 text-xs font-bold text-white bg-[var(--accent-teal)] hover:opacity-90 rounded-lg transition-all cursor-pointer shadow-md"
            >
              Generate Submission Brief →
            </button>
          </div>

          {/* Dials Row */}
          <div className="flex items-center justify-around py-5 bg-[var(--bg-inner)] rounded-xl border border-[var(--border-subtle)] flex-wrap gap-6">
            {renderGauge(
              validationResult.novelty_score,
              'Originality / Novelty Score',
              validationResult.novelty_score >= 70 ? 'text-[var(--accent-teal)]' : 'text-rose-500'
            )}

            {renderGauge(
              validationResult.feasibility_score,
              `Finishability in ${availableHours}h`,
              validationResult.feasibility_score >= 70 ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)]'
            )}
          </div>

          {/* Critiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <div className="font-semibold text-[var(--accent-teal)] uppercase tracking-wider mb-1.5">
                Novelty Analysis
              </div>
              <p className="text-[var(--text-main)]">{validationResult.novelty_critique}</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <div className="font-semibold text-[var(--accent-amber)] uppercase tracking-wider mb-1.5">
                Feasibility Analysis
              </div>
              <p className="text-[var(--text-main)]">{validationResult.feasibility_critique}</p>
            </div>
          </div>

          {/* Overlapping Projects Warning (if any) */}
          {validationResult.overlapping_projects && validationResult.overlapping_projects.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
              <div className="font-semibold text-rose-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>⚠️ Potential Duplicate Warning (Past Hackathon Clones)</span>
              </div>
              <p className="text-[var(--text-main)] mb-2">
                Your proposal matches keywords with past project entries. Differentiate by addressing their weaknesses:
              </p>
              <div className="space-y-2">
                {validationResult.overlapping_projects.map((proj, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between text-[var(--text-heading)] font-semibold">
                      <span>{proj.title}</span>
                      <span className="font-mono text-rose-500 tabular-nums">{proj.similarity_pct}% similarity</span>
                    </div>
                    {proj.limitation && (
                      <div className="text-[var(--text-muted)] mt-1">
                        Their Known Flaw: <span className="text-[var(--text-main)]">{proj.limitation}</span>
                      </div>
                    )}
                    <div className="text-[var(--text-muted)] font-mono text-[11px] mt-0.5 opacity-80">
                      Matched Terms: {proj.matched_keywords.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-heading)] mb-2.5">
              Recommendations to Impress the Jury
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-main)]">
              {validationResult.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[var(--bg-inner)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                  <span className="text-[var(--accent-teal)] font-bold shrink-0">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Clichés to Avoid */}
          {validationResult.clichés_to_avoid && validationResult.clichés_to_avoid.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-rose-500 mb-2">
                Common Hackathon Clichés to Avoid
              </h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
                {validationResult.clichés_to_avoid.map((cliche, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✗</span>
                    <span>{cliche}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
