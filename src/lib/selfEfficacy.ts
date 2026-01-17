import { Question, getQuestionsForGrade } from '@/lib/gradeQuestions';
import { getTranslatedQuestions } from '@/lib/translatedQuestions';
import type { Language } from '@/contexts/LanguageContext';

export type SessionType = 'dyslexia' | 'dyscalculia';

export interface SessionSummary {
  session_type: SessionType;
  overall_score: number | null;
  created_at: string;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function parseGradeToNumber(grade: string | null): number {
  if (!grade) return 1;
  const match = grade.match(/\d+/);
  const num = match ? Number.parseInt(match[0], 10) : NaN;
  if (Number.isNaN(num) || num < 1 || num > 12) return 1;
  return num;
}

export function chooseSessionType(sessions: SessionSummary[]): SessionType {
  // If we have recent sessions, focus practice on the weaker area.
  const latestDyslexia = sessions.find(s => s.session_type === 'dyslexia');
  const latestDyscalculia = sessions.find(s => s.session_type === 'dyscalculia');
  if (latestDyslexia && latestDyscalculia) {
    const d1 = latestDyslexia.overall_score ?? 0;
    const d2 = latestDyscalculia.overall_score ?? 0;
    return d1 <= d2 ? 'dyslexia' : 'dyscalculia';
  }
  if (latestDyslexia) return 'dyslexia';
  if (latestDyscalculia) return 'dyscalculia';
  // Default to alternating, but deterministic based on day to avoid jitter
  const day = new Date().getDate();
  return day % 2 === 0 ? 'dyslexia' : 'dyscalculia';
}

export function selectAdaptiveQuestion(
  gradeNum: number,
  language: Language,
  sessions: SessionSummary[]
): (Question & { sessionType: SessionType }) {
  const sessionType = chooseSessionType(sessions);
  const translated = getTranslatedQuestions(gradeNum, sessionType, language);
  const bank = translated.length > 0 ? translated : getQuestionsForGrade(gradeNum, sessionType);
  const q = pick(bank);
  const fallback: Question = q || { id: 0, text: sessionType === 'dyscalculia' ? 'What is 2 + 1?' : 'Say the word: CAT', expectedAnswer: sessionType === 'dyscalculia' ? '3' : 'cat', type: sessionType === 'dyscalculia' ? 'calculation' : 'word' };
  return { ...fallback, sessionType };
}

export interface ComplimentContext {
  correct: boolean;
  confidence: number; // 0-100
  streak: number; // current streak
  sessionType: SessionType;
}

const baseSuccess = [
  'Amazing job! Keep it up!',
  'Great work — you got it!',
  'Fantastic! You’re on a roll!',
  'Brilliant answer! Proud of you!',
  'You’re a star! Well done!',
];

const baseEffort = [
  'Great effort! Keep trying!',
  'Nice attempt — you’ve got this!',
  'Don’t give up, you’re learning!',
  'Good try! Practice makes progress!',
  'You’re improving every day — keep going!',
];

export function generateCompliment(ctx: ComplimentContext): string {
  // Scale messages by confidence and streak
  const { correct, confidence, streak, sessionType } = ctx;
  const domain = sessionType === 'dyscalculia' ? 'Math' : 'Reading';

  if (correct && confidence >= 90) {
    const high = [
      `Outstanding ${domain}! You nailed it!`,
      `Top marks — superb ${domain}!`,
      `Ace level ${domain}! Keep shining!`,
    ];
    return pick(high);
  }

  if (correct && confidence >= 75) {
    const mid = [
      `Great ${domain} work — solid answer!`,
      `Nice job — your ${domain} skills are growing!`,
      `Well done — confident ${domain}!`,
    ];
    return pick(mid);
  }

  if (!correct && confidence >= 60) {
    const near = [
      `So close on ${domain}! One more try will do!`,
      `Almost there — your ${domain} thinking is right!`,
      `Good progress — refine and you’ll get it!`,
    ];
    return pick(near);
  }

  // Streak-based boosters
  if (streak >= 5) {
    const streaky = [
      `Streak ${streak}! Incredible dedication — keep going!`,
      `Five-day streak! Consistency builds mastery!`,
      `You’re building a strong habit — proud of you!`,
    ];
    return pick(streaky);
  }

  return correct ? pick(baseSuccess) : pick(baseEffort);
}

export interface StreakState { lastDate: string | null; current: number; }

export function getStreakKey(childId: string) {
  return `dailyPracticeStreak:${childId}`;
}

export function updateStreak(childId: string): StreakState {
  const key = getStreakKey(childId);
  const raw = localStorage.getItem(key);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  let current = 0;
  let lastDate: string | null = null;

  if (raw) {
    try {
      const parsed: StreakState = JSON.parse(raw);
      lastDate = parsed.lastDate;
      current = parsed.current;
    } catch {}
  }

  if (!lastDate) {
    current = 1;
    lastDate = todayStr;
  } else {
    const last = new Date(lastDate);
    const diffMs = today.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // already counted today; keep current
    } else if (diffDays === 1) {
      current += 1; // consecutive day
      lastDate = todayStr;
    } else {
      current = 1; // reset streak
      lastDate = todayStr;
    }
  }

  const saved: StreakState = { lastDate, current };
  localStorage.setItem(key, JSON.stringify(saved));
  return saved;
}
