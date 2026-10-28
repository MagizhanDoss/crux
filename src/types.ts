/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Sector =
  | 'All'
  | 'Agriculture'
  | 'Healthcare'
  | 'Civic & Transport'
  | 'Water & Sanitation'
  | 'Education & Skilling'
  | 'Clean Energy & Climate'
  | 'Governance & PDS'
  | 'Small Business & Trade';

export type SourceType =
  | 'All'
  | 'Smart India Hackathon (SIH)'
  | 'CPGRAMS (Citizen Grievances)'
  | 'data.gov.in (Open Gov Data)'
  | 'Grassroots / Community';

export type Difficulty = 'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Research Track';

export type Skill = 'web' | 'app' | 'ai' | 'data' | 'ece' | 'design';

export interface PastClone {
  name: string;
  keywords: string[];
  limitation: string;
}

export interface ProblemStatement {
  id: string;
  title: string;
  organization: string;
  sourceType: 'Smart India Hackathon (SIH)' | 'CPGRAMS (Citizen Grievances)' | 'data.gov.in (Open Gov Data)' | 'Grassroots / Community';
  sourceCode: string;
  sourceUrl?: string;
  sector: 'Agriculture' | 'Healthcare' | 'Civic & Transport' | 'Water & Sanitation' | 'Education & Skilling' | 'Clean Energy & Climate' | 'Governance & PDS' | 'Small Business & Trade';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Research Track';
  location: string;
  painPoint: string;
  beneficiaries: string;
  impactSeverity: 'Critical' | 'High' | 'Medium';
  suggestedSkills: Skill[];
  hackathonTrack: 'Software' | 'Hardware / IoT' | 'Open Innovation';
  estimatedHours: number;
  sdgGoal: string;
  baselineAttempts: string;
  novelAngleOpportunity: string;
  pastClones: PastClone[];
  dataSources: string[];
  verificationStatus: 'Verified Official' | 'Citizen Verified' | 'Peer Reviewed';
  exploringCount: number;
  sampleTechStack: string[];
  submissionRubric?: {
    noveltyWeight: number;
    feasibilityWeight: number;
    impactWeight: number;
    uiUxWeight: number;
  };
  // Gemini Semantic Search enrichment
  semanticScore?: number;
  relevanceReason?: string;
  matchingTheme?: string;
  suggestedAngles?: string[];
}

export interface SemanticSearchResult {
  success: boolean;
  ai_powered: boolean;
  query: string;
  intent_summary?: string;
  identified_domains?: string[];
  results: ProblemStatement[];
}

export interface ValidationResult {
  novelty_score: number;
  feasibility_score: number;
  novelty_critique?: string;
  feasibility_critique?: string;
  recommendations: string[];
  clichés_to_avoid?: string[];
  overlapping_projects: {
    title: string;
    matched_keywords: string[];
    limitation?: string;
    similarity_pct: number;
  }[];
  evaluated_by: string;
}

export interface DatabaseStats {
  total_problems: number;
  total_exploring_teams: number;
  sector_distribution: Record<string, number>;
  source_distribution: Record<string, number>;
  difficulty_distribution: Record<string, number>;
  skill_demand: Record<string, number>;
}

export type ThemeMode = 'dark' | 'light';

export interface User {
  id: string;
  email: string;
  name: string;
  teamName: string;
  teamId: string;
  institution?: string;
  role?: string;
  createdAt?: string;
}

