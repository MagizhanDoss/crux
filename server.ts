/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROBLEM_DATABASE, ProblemStatement } from './src/data/problemsData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database file persistence
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'problems.json');

function ensureDataFile(): ProblemStatement[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // If JSON is corrupt/truncated, re-seed cleanly from compiled data
        }
      }
    }
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(INITIAL_PROBLEM_DATABASE, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    return INITIAL_PROBLEM_DATABASE;
  } catch (err) {
    console.warn('Recovering problems database with compiled data:', err);
    return INITIAL_PROBLEM_DATABASE;
  }
}

function saveDatabase(problems: ProblemStatement[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(problems, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Failed to persist problems database to disk:', err);
  }
}

let problemsDb: ProblemStatement[] = ensureDataFile();

// Users Database Persistence
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  teamName: string;
  teamId: string;
  institution?: string;
  role: string;
  createdAt: string;
}

function ensureUsersFile(): UserRecord[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const initialUsers: UserRecord[] = [
      {
        id: 'usr_dex26297_lead',
        email: 'magizhandoss@gmail.com',
        passwordHash: 'hackathon2026',
        name: 'Magizhan Doss',
        teamName: 'COGNIHUB',
        teamId: 'DEX26297',
        institution: 'Sathyabama Institute of Science and Technology',
        role: 'Team Lead',
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
    return initialUsers;
  } catch (err) {
    console.error('Failed to load users file:', err);
    return [];
  }
}

let usersDb: UserRecord[] = ensureUsersFile();

function saveUsers() {
  try {
    const tempFile = `${USERS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(usersDb, null, 2), 'utf-8');
    fs.renameSync(tempFile, USERS_FILE);
  } catch (err) {
    console.error('Failed to save users file:', err);
  }
}

// --- API Endpoints ---

// 0. User Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const existing = usersDb.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    // If password matches or demo mode
    if (existing.passwordHash === password || password === 'hackathon2026' || password.length >= 6) {
      const { passwordHash, ...safeUser } = existing;
      res.json({ success: true, user: safeUser });
      return;
    } else {
      res.status(401).json({ error: 'Incorrect password. Try "hackathon2026" or enter at least 6 characters.' });
      return;
    }
  }

  // Auto-provision new student account for zero-friction hackathon evaluation
  const newUser: UserRecord = {
    id: `usr_${Date.now()}`,
    email,
    passwordHash: password,
    name: email.split('@')[0],
    teamName: 'COGNIHUB',
    teamId: 'DEX26297',
    institution: 'Sathyabama Institute of Science and Technology',
    role: 'Student Builder',
    createdAt: new Date().toISOString(),
  };
  usersDb.push(newUser);
  saveUsers();

  const { passwordHash, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name, teamName, teamId, institution } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const existingIndex = usersDb.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingIndex >= 0) {
    // Update existing
    usersDb[existingIndex] = {
      ...usersDb[existingIndex],
      name: name || usersDb[existingIndex].name,
      teamName: teamName || usersDb[existingIndex].teamName,
      teamId: teamId || usersDb[existingIndex].teamId,
      institution: institution || usersDb[existingIndex].institution,
    };
    saveUsers();
    const { passwordHash, ...safeUser } = usersDb[existingIndex];
    res.json({ success: true, user: safeUser });
    return;
  }

  const newUser: UserRecord = {
    id: `usr_${Date.now()}`,
    email,
    passwordHash: password,
    name: name || email.split('@')[0],
    teamName: teamName || 'COGNIHUB',
    teamId: teamId || 'DEX26297',
    institution: institution || 'Sathyabama University',
    role: 'Team Lead',
    createdAt: new Date().toISOString(),
  };
  usersDb.push(newUser);
  saveUsers();

  const { passwordHash, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const sample = usersDb[0] || {
    id: 'usr_guest',
    email: 'guest@dexathon.in',
    name: 'Student Builder',
    teamName: 'COGNIHUB',
    teamId: 'DEX26297',
    role: 'Guest',
  };
  const { passwordHash, ...safeUser } = sample as any;
  res.json({ user: safeUser });
});

// 1. Health check & Metadata
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Crux Problem Discovery & Validation Engine',
    team: 'COGNIHUB (DEX26297)',
    dexathon_track: 'Open Innovation',
    total_problems: problemsDb.length,
    total_users: usersDb.length,
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. Aggregated Analytics & Sector Stats (for higher-level usage)
app.get('/api/stats', (req: Request, res: Response) => {
  const sectorCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  const skillDemands: Record<string, number> = {};

  let totalExploring = 0;

  for (const p of problemsDb) {
    sectorCounts[p.sector] = (sectorCounts[p.sector] || 0) + 1;
    sourceCounts[p.sourceType] = (sourceCounts[p.sourceType] || 0) + 1;
    difficultyCounts[p.difficulty] = (difficultyCounts[p.difficulty] || 0) + 1;
    totalExploring += p.exploringCount || 0;

    for (const sk of p.suggestedSkills) {
      skillDemands[sk] = (skillDemands[sk] || 0) + 1;
    }
  }

  res.json({
    total_problems: problemsDb.length,
    total_exploring_teams: totalExploring,
    sector_distribution: sectorCounts,
    source_distribution: sourceCounts,
    difficulty_distribution: difficultyCounts,
    skill_demand: skillDemands,
  });
});

// 3. Search & Filter Problem Statements
app.get('/api/problems', (req: Request, res: Response) => {
  const { sector, sourceType, difficulty, skill, q, sort } = req.query;

  let results = [...problemsDb];

  if (sector && typeof sector === 'string' && sector !== 'All') {
    results = results.filter((p) => p.sector.toLowerCase() === sector.toLowerCase());
  }

  if (sourceType && typeof sourceType === 'string' && sourceType !== 'All') {
    results = results.filter((p) => p.sourceType.toLowerCase() === sourceType.toLowerCase());
  }

  if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
    results = results.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (skill && typeof skill === 'string' && skill !== 'All') {
    results = results.filter((p) => p.suggestedSkills.includes(skill as any));
  }

  if (q && typeof q === 'string') {
    const term = q.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.painPoint.toLowerCase().includes(term) ||
        p.organization.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.sourceCode.toLowerCase().includes(term) ||
        p.sector.toLowerCase().includes(term) ||
        p.beneficiaries.toLowerCase().includes(term) ||
        p.pastClones.some((c) => c.name.toLowerCase().includes(term) || c.keywords.some((k) => k.includes(term)))
    );
  }

  // Sorting
  if (sort === 'exploring') {
    results.sort((a, b) => (b.exploringCount || 0) - (a.exploringCount || 0));
  } else if (sort === 'hours_asc') {
    results.sort((a, b) => a.estimatedHours - b.estimatedHours);
  } else if (sort === 'hours_desc') {
    results.sort((a, b) => b.estimatedHours - a.estimatedHours);
  }

    res.json(results);
});

// 3b. Gemini-Powered Semantic Search
app.post('/api/problems/semantic-search', async (req: Request, res: Response) => {
  try {
    const { query, sector, difficulty, limit = 15 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'Search query string is required.' });
      return;
    }

    const trimmedQuery = query.trim();

    // Candidate filtering
    let candidates = [...problemsDb];
    if (sector && sector !== 'All') {
      candidates = candidates.filter((p) => p.sector.toLowerCase() === sector.toLowerCase());
    }
    if (difficulty && difficulty !== 'All') {
      candidates = candidates.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (candidates.length === 0) {
      res.json({
        success: true,
        ai_powered: false,
        query: trimmedQuery,
        intent_summary: 'No candidates matched the current sector or difficulty filter.',
        identified_domains: [],
        results: [],
      });
      return;
    }

    // Try Gemini 3.8 Flash Semantic Matching
    if (process.env.GEMINI_API_KEY) {
      try {
        const compactCatalog = candidates.slice(0, 50).map((p) => ({
          id: p.id,
          title: p.title,
          org: p.organization,
          sector: p.sector,
          difficulty: p.difficulty,
          painPoint: p.painPoint.slice(0, 180),
          opportunity: p.novelAngleOpportunity.slice(0, 150),
          skills: p.suggestedSkills,
        }));

        const prompt = `You are the AI Semantic Search Engine for the Crux Open Innovation Platform (Sathyabama Dexathon 2026).
A hackathon innovator or researcher entered this natural language conceptual search inquiry:
"${trimmedQuery}"

TASK:
1. Understand their conceptual intent, core domain, desired societal impact, and implied technical constraints.
   (e.g., understand that "help blind kids read diagrams" maps to inclusive screen reader sonification, or "prevent medicine going bad in hot weather" maps to PHC vaccine cold-chain IoT, or "stop fake fertilizer sales" maps to fertilizer bag anti-counterfeiting).
2. Evaluate candidate problem statements and select the top relevant problems (up to ${limit}) that best resonate with the user's implicit goal, even if they share zero exact keywords.
3. For each selected match, provide:
   - "id": exact problem ID from the candidate list
   - "semantic_score": integer between 50 and 99 reflecting how closely it aligns with the user's intent
   - "relevance_reason": exactly 1-2 crisp sentences explaining WHY this specific problem aligns with the user's goal
   - "matching_theme": a 2-4 word phrase identifying the conceptual focus (e.g. "Cold-Chain Preservation", "Accessible STEM Sonification", "Smart Grid Decentralization")
   - "suggested_angles": 2 innovative starting approaches or technical angles for a hackathon MVP

Return ONLY valid JSON matching this structure:
{
  "intent_summary": "1 sentence defining the user's core problem-solving intent",
  "identified_domains": ["domain1", "domain2", "domain3"],
  "matches": [
    {
      "id": "...",
      "semantic_score": 95,
      "relevance_reason": "...",
      "matching_theme": "...",
      "suggested_angles": ["...", "..."]
    }
  ]
}

CANDIDATE PROBLEM STATEMENTS:
${JSON.stringify(compactCatalog)}`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 6500)
        );

        let responseText: string | undefined;
        try {
          const geminiPromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });
          const geminiResponse = await Promise.race([geminiPromise, timeoutPromise]);
          responseText = geminiResponse.text?.trim();
        } catch (primaryErr: any) {
          console.warn('Gemini 3.8 Flash busy or timed out, trying gemini-3.1-flash-lite fallback:', primaryErr?.message);
          try {
            const fallbackPromise = ai.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              },
            });
            const fallbackResponse = await Promise.race([
              fallbackPromise,
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Fallback timeout')), 4500)),
            ]);
            responseText = fallbackResponse.text?.trim();
          } catch (secondaryErr: any) {
            console.warn('Fallback model also unavailable:', secondaryErr?.message);
          }
        }
        if (responseText) {
          const parsed = JSON.parse(responseText);
          const matches = Array.isArray(parsed.matches) ? parsed.matches : [];

          // Map back to full problem records and enrich
          const enrichedResults: ProblemStatement[] = [];
          for (const m of matches) {
            const original = candidates.find((p) => p.id === m.id);
            if (original) {
              enrichedResults.push({
                ...original,
                semanticScore: typeof m.semantic_score === 'number' ? m.semantic_score : 80,
                relevanceReason: m.relevance_reason || 'Matches semantic context of the query.',
                matchingTheme: m.matching_theme || original.sector,
                suggestedAngles: Array.isArray(m.suggested_angles) ? m.suggested_angles : [],
              });
            }
          }

          // Sort by semantic score descending
          enrichedResults.sort((a, b) => (b.semanticScore || 0) - (a.semanticScore || 0));

          if (enrichedResults.length > 0) {
            res.json({
              success: true,
              ai_powered: true,
              query: trimmedQuery,
              intent_summary: parsed.intent_summary || `Semantic results for "${trimmedQuery}"`,
              identified_domains: parsed.identified_domains || [],
              results: enrichedResults,
            });
            return;
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini semantic search fallback activated:', geminiErr?.message || geminiErr);
      }
    }

    // Heuristic Fallback Semantic Matching
    const queryTokens = trimmedQuery
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scored = candidates
      .map((p) => {
        let score = 50;
        const textToMatch = `${p.title} ${p.painPoint} ${p.beneficiaries} ${p.novelAngleOpportunity} ${p.sector} ${p.suggestedSkills.join(' ')}`.toLowerCase();

        let hitCount = 0;
        for (const token of queryTokens) {
          if (textToMatch.includes(token)) {
            hitCount++;
          }
        }

        if (queryTokens.length > 0) {
          const ratio = hitCount / queryTokens.length;
          score = Math.min(96, Math.round(55 + ratio * 40));
        }

        return {
          ...p,
          semanticScore: score,
          relevanceReason: `Heuristic semantic match based on contextual alignment with "${trimmedQuery}".`,
          matchingTheme: `${p.sector} Domain`,
          suggestedAngles: [p.novelAngleOpportunity, `Prototyping MVP using ${p.sampleTechStack.slice(0, 2).join(' + ')}`],
        };
      })
      .filter((p) => p.semanticScore && p.semanticScore > 55)
      .sort((a, b) => (b.semanticScore || 0) - (a.semanticScore || 0))
      .slice(0, limit);

    res.json({
      success: true,
      ai_powered: false,
      query: trimmedQuery,
      intent_summary: `Heuristic matches for "${trimmedQuery}"`,
      identified_domains: Array.from(new Set(scored.map((s) => s.sector))),
      results: scored,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Semantic search failed', details: err.message });
  }
});

// 4. Get Single Problem by ID
app.get('/api/problems/:id', (req: Request, res: Response) => {
  const problem = problemsDb.find((p) => p.id === req.params.id);
  if (!problem) {
    res.status(404).json({ error: 'Problem not found' });
    return;
  }
  res.json(problem);
});

// 5. Increment Exploring Counter
app.post('/api/problems/:id/explore', (req: Request, res: Response) => {
  const problem = problemsDb.find((p) => p.id === req.params.id);
  if (!problem) {
    res.status(404).json({ error: 'Problem not found' });
    return;
  }
  problem.exploringCount = (problem.exploringCount || 0) + 1;
  saveDatabase(problemsDb);
  res.json({ id: problem.id, exploringCount: problem.exploringCount });
});

// 6. Community / Grassroots Submission
app.post('/api/problems', (req: Request, res: Response) => {
  try {
    const {
      title,
      organization,
      sector,
      location,
      painPoint,
      beneficiaries,
      sourceType,
      sourceCode,
      suggestedSkills,
      estimatedHours,
      difficulty,
    } = req.body;

    if (!title || !sector || !painPoint || !beneficiaries) {
      res.status(400).json({ error: 'Missing mandatory fields: title, sector, painPoint, beneficiaries.' });
      return;
    }

    const newProblem: ProblemStatement = {
      id: `COMM-${Date.now().toString(36).toUpperCase()}`,
      title,
      organization: organization || 'Local Community / Ground Report',
      sourceType: sourceType || 'Grassroots / Community',
      sourceCode: sourceCode || `GRASSROOTS-${new Date().getFullYear()}`,
      sector,
      difficulty: difficulty || 'Intermediate',
      location: location || 'Field Context',
      painPoint,
      beneficiaries,
      impactSeverity: 'High',
      suggestedSkills: suggestedSkills && suggestedSkills.length ? suggestedSkills : ['web', 'data'],
      hackathonTrack: 'Open Innovation',
      estimatedHours: estimatedHours || 36,
      sdgGoal: 'SDG 11: Sustainable Communities',
      baselineAttempts: 'Manual spreadsheets and unstructured phone calls.',
      novelAngleOpportunity: 'Streamlined localized digital interface with offline telemetry.',
      pastClones: [],
      dataSources: ['Community Field Interviews & Citizen Logs'],
      verificationStatus: 'Citizen Verified',
      exploringCount: 1,
      sampleTechStack: ['React', 'Express / Node', 'Tailwind CSS'],
    };

    problemsDb.unshift(newProblem);
    saveDatabase(problemsDb);

    res.status(201).json(newProblem);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create problem statement', details: err.message });
  }
});

// 7. High-Level Database Export (JSON or CSV)
app.get('/api/database/export', (req: Request, res: Response) => {
  const format = req.query.format || 'json';

  if (format === 'csv') {
    const headers = [
      'id',
      'title',
      'organization',
      'sourceType',
      'sourceCode',
      'sector',
      'difficulty',
      'location',
      'painPoint',
      'beneficiaries',
      'impactSeverity',
      'estimatedHours',
      'verificationStatus',
      'exploringCount',
    ];

    const escapeCsv = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = problemsDb.map((p) => [
      escapeCsv(p.id),
      escapeCsv(p.title),
      escapeCsv(p.organization),
      escapeCsv(p.sourceType),
      escapeCsv(p.sourceCode),
      escapeCsv(p.sector),
      escapeCsv(p.difficulty),
      escapeCsv(p.location),
      escapeCsv(p.painPoint),
      escapeCsv(p.beneficiaries),
      escapeCsv(p.impactSeverity),
      p.estimatedHours,
      escapeCsv(p.verificationStatus),
      p.exploringCount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="crux_problems_database.csv"');
    res.send(csvContent);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="crux_problems_database.json"');
    res.send(JSON.stringify(problemsDb, null, 2));
  }
});

// 8. Idea Validation & Novelty Scoring (AI-powered with heuristic fallback)
app.post('/api/validate', async (req: Request, res: Response) => {
  const { idea, problem_id, team_skills = ['web', 'data'], available_hours = 36 } = req.body;

  if (!idea || typeof idea !== 'string' || idea.trim().length < 8) {
    res.status(400).json({ error: 'Please enter a description of at least 8 characters for your idea.' });
    return;
  }

  const problem = problemsDb.find((p) => p.id === problem_id) || problemsDb[0];

  // Heuristic baseline calculations
  const ideaLower = idea.toLowerCase();
  const matchedClones: { title: string; matched_keywords: string[]; limitation: string; similarity_pct: number }[] = [];

  for (const clone of problem.pastClones || []) {
    const hits = clone.keywords.filter((kw) => ideaLower.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      const sim = Math.min(95, Math.round((hits.length / clone.keywords.length) * 100) + 20);
      matchedClones.push({
        title: clone.name,
        matched_keywords: hits,
        limitation: clone.limitation,
        similarity_pct: sim,
      });
    }
  }

  // Calculate skill match
  const requiredSkills = problem.suggestedSkills || ['web', 'data'];
  const matchedSkills = requiredSkills.filter((sk) => team_skills.includes(sk));
  const skillCoverage = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 1;

  // Feasibility heuristic
  const timeFactor = Math.min(1.2, available_hours / (problem.estimatedHours || 36));
  const baselineFeasibility = Math.round(Math.min(98, Math.max(25, (0.6 * skillCoverage + 0.4 * timeFactor) * 95)));

  // Novelty heuristic
  let baselineNovelty = 92;
  if (matchedClones.length > 0) {
    const maxSim = Math.max(...matchedClones.map((c) => c.similarity_pct));
    baselineNovelty = Math.max(22, 100 - maxSim);
  }

  // Try calling Gemini API if configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a Chief Judge and Technical Evaluator for the Dexathon 2026 hackathon (Sathyabama Institute of Science and Technology).
Evaluate this student team's solution proposal against an authentic problem statement from Smart India Hackathon / CPGRAMS.

PROBLEM STATEMENT:
Title: ${problem.title}
Ministry / Source: ${problem.organization} (${problem.sourceCode})
Ground Pain Point: ${problem.painPoint}
Beneficiaries: ${problem.beneficiaries}
Known Existing Baseline / Traps: ${problem.baselineAttempts}
Novel Angle Opportunity: ${problem.novelAngleOpportunity}

STUDENT TEAM'S PROPOSED IDEA:
"${idea}"

TEAM CAPABILITIES:
Available Hackathon Sprint Hours: ${available_hours} hours
Team Technical Skills: ${team_skills.join(', ')}

Evaluate and return a structured JSON response with:
1. novelty_score (integer between 0 and 100, where 100 is completely original and 30 or below is a generic clone)
2. feasibility_score (integer between 0 and 100, can they genuinely finish a working MVP in ${available_hours}h with their skills?)
3. novelty_critique (2-3 sentences evaluating why this idea stands out or where it risks looking like past hackathon clones)
4. feasibility_critique (2-3 sentences on what can realistically be completed within the ${available_hours}h sprint)
5. key_differentiators (list of 3 sharp concrete features that would make judges award 1st prize)
6. clichés_to_avoid (list of 2 common hackathon mistakes to avoid for this domain)`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = geminiResponse.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText);
        res.json({
          novelty_score: parsed.novelty_score ?? baselineNovelty,
          feasibility_score: parsed.feasibility_score ?? baselineFeasibility,
          novelty_critique: parsed.novelty_critique,
          feasibility_critique: parsed.feasibility_critique,
          recommendations: parsed.key_differentiators || [
            'Integrate offline-first local storage for spotty rural connectivity',
            'Focus on a single high-impact user workflow rather than 10 half-built screens',
            'Provide measurable quantitative metrics (e.g. claim turnaround from 4 months to 48 hours)',
          ],
          clichés_to_avoid: parsed.clichés_to_avoid || [
            'Building a standard login and landing page before the core algorithm works',
            'Claiming 99.9% accuracy on simulated toy datasets',
          ],
          overlapping_projects: matchedClones,
          evaluated_by: 'Gemini 3.8 Flash (Hackathon Judge Mode)',
        });
        return;
      }
    } catch (err) {
      console.warn('Gemini evaluation error, using heuristic fallback:', err);
    }
  }

  // Heuristic fallback response
  const recs = [
    matchedClones.length > 0
      ? `Differentiate from past clones like "${matchedClones[0].title}" by directly addressing their limitation: ${matchedClones[0].limitation}`
      : 'Prioritize an offline-first workflow that functions without reliable 4G connectivity.',
    `Ensure your tech stack leverages your declared strengths: ${team_skills.join(', ')}.`,
    `Scope your ${available_hours}h sprint: Deliver 1 airtight, end-to-end working demonstration rather than multiple superficial tabs.`,
  ];

  res.json({
    novelty_score: baselineNovelty,
    feasibility_score: baselineFeasibility,
    novelty_critique:
      baselineNovelty > 70
        ? 'Strong original angle targeting ground reality without repeating generic web portal tropes.'
        : 'Your proposal contains overlapping keywords with existing hackathon projects. Add a concrete local or offline mechanism to stand out.',
    feasibility_critique: `With ${available_hours} hours and skills in [${team_skills.join(', ')}], the scope is manageable if you mock non-essential peripheral APIs and focus 80% of time on the core mechanism.`,
    recommendations: recs,
    clichés_to_avoid: [
      'Spending the first 12 hours designing authentication and signup forms.',
      'Relying on internet access for field demonstrations in front of the judges.',
    ],
    overlapping_projects: matchedClones,
    evaluated_by: 'Crux Heuristic Evaluation Matrix (Fast Local Mode)',
  });
});

// 9. Structured Hackathon Problem Brief Generator
app.post('/api/brief', async (req: Request, res: Response) => {
  const {
    team_name = 'COGNIHUB',
    team_id = 'DEX26297',
    problem_id,
    idea_summary,
    team_skills = ['web', 'data'],
    available_hours = 36,
  } = req.body;

  const problem = problemsDb.find((p) => p.id === problem_id) || problemsDb[0];

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Generate an authoritative, executive-grade Hackathon Problem Statement Brief for team "${team_name}" (Team ID: ${team_id}) participating in Dexathon 2026 (Sathyabama Institute of Science and Technology).

PROBLEM DATA:
Code: ${problem.sourceCode}
Title: ${problem.title}
Authority: ${problem.organization} (${problem.sourceType})
Location: ${problem.location}
Pain Point: ${problem.painPoint}
Beneficiaries: ${problem.beneficiaries}
UN SDG Goal: ${problem.sdgGoal}

TEAM SOLUTION IDEA:
${idea_summary || 'Digital and automated field solution addressing the core bottleneck.'}

TEAM DETAILS:
Skills: ${team_skills.join(', ')}
Time: ${available_hours} hours sprint

Output the brief in clear, professional markdown with numbered sections:
1. Executive Summary & Problem Title
2. Ground Problem Breakdown & Evidence Citation
3. Primary Beneficiaries & Field Context
4. Proposed Solution Architecture & Innovation
5. Competitive Differentiation (Why this beats existing naive attempts)
6. Feasibility & ${available_hours}-Hour Sprint Milestones
7. Expected Social & Economic Impact`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const briefText = geminiResponse.text?.trim();
      if (briefText) {
        res.json({ brief: briefText, generated_by: 'Gemini 3.8 Flash' });
        return;
      }
    } catch (err) {
      console.warn('Gemini brief generator fallback triggered:', err);
    }
  }

  // Template fallback
  const fallbackBrief = `================================================================================
DEXATHON 2026: OFFICIAL PROBLEM STATEMENT BRIEF
Team Name: ${team_name} | Team ID: ${team_id}
Theme: Open Innovation | Category: Software / Embedded
Host: Sathyabama Institute of Science and Technology
================================================================================

1. PROBLEM TITLE & SOURCE IDENTIFIER
Title: ${problem.title}
Reference: ${problem.sourceCode}
Issuing Authority: ${problem.organization} [${problem.sourceType}]
SDG Alignment: ${problem.sdgGoal}

2. THE ROOT PROBLEM & OPERATIONAL FRICTION
${problem.painPoint}

3. TARGET BENEFICIARIES & GEOGRAPHIC SETTING
Direct Beneficiaries: ${problem.beneficiaries}
Field Setting: ${problem.location}
Severity Rating: ${problem.impactSeverity}

4. PROPOSED SOLUTION & ARCHITECTURAL APPROACH
${idea_summary || 'An integrated, responsive software/hardware system designed to eliminate manual intervention and data loss.'}
Target Tech Stack: ${problem.sampleTechStack.join(' • ')}

5. NOVELTY & COMPETITIVE DIFFERENTIATION
Baseline Trap Avoided: ${problem.baselineAttempts}
Crux Innovation Angle: ${problem.novelAngleOpportunity}

6. FEASIBILITY & ${available_hours}-HOUR SPRINT ROADMAP
Allocated Sprint Duration: ${available_hours} Hours
Team Technical Strengths: ${team_skills.join(', ')}
• Phase 1 (Hours 0-10): Data pipeline, offline schemas, and core sensor/API mock.
• Phase 2 (Hours 10-24): Primary user workflow, inference/matching engine, and reactive UI.
• Phase 3 (Hours 24-${available_hours}): Edge cases, validation tests, exportable brief, and judge pitch deck.

7. VERIFIABLE EVIDENCE & PUBLIC DATA SOURCES
${problem.dataSources.map((ds) => `• ${ds}`).join('\n')}

Generated via Crux (Team COGNIHUB - DEX26297)
================================================================================`;

  res.json({ brief: fallbackBrief, generated_by: 'Crux Template Engine' });
});

// Setup Vite dev server middlewares or static dist
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Crux server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
