import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Question } from '@/lib/gradeQuestions';
import { selectAdaptiveQuestion, generateCompliment, updateStreak, getStreakKey, parseGradeToNumber, SessionSummary } from '@/lib/selfEfficacy';
import { validateAnswer, validateNumericAnswer } from '@/lib/answerValidation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  age: number | null;
  grade: string | null;
}

type SessionType = 'dyslexia' | 'dyscalculia';

interface StoredDailyPractice {
  question: Question & { sessionType: SessionType };
  answered: boolean;
  response?: string;
  correct?: boolean;
  compliment?: string;
}

function todayKey(childId: string) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `dailyPractice:${childId}:${y}-${m}-${d}`;
}

const successCompliments = [
  'Amazing job! Keep it up!',
  'Great work — you got it!',
  'Fantastic! You’re on a roll!',
  'Brilliant answer! Proud of you!',
  'You’re a star! Well done!',
];

const effortCompliments = [
  'Great effort! Keep trying!',
  'Nice attempt — you’ve got this!',
  'Don’t give up, you’re learning!',
  'Good try! Practice makes progress!',
  'You’re improving every day — keep going!',
];

export default function DailyPractice({ student, sessions }: { student: Student; sessions: SessionSummary[] }) {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const gradeNum = useMemo(() => parseGradeToNumber(student.grade), [student.grade]);
  const storageKey = useMemo(() => todayKey(student.id), [student.id]);
  const streakKey = useMemo(() => getStreakKey(student.id), [student.id]);

  const [question, setQuestion] = useState<(Question & { sessionType: SessionType }) | null>(null);
  const [response, setResponse] = useState('');
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [compliment, setCompliment] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    // Load or initialize the daily question
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const saved: StoredDailyPractice = JSON.parse(raw);
        setQuestion(saved.question);
        setAnswered(saved.answered);
        setResponse(saved.response || '');
        setCorrect(saved.correct ?? null);
        setCompliment(saved.compliment || null);
        return;
      } catch {
        // fall through to reinitialize
      }
    }

    // Initialize streak view
    const rawStreak = localStorage.getItem(streakKey);
    if (rawStreak) {
      try {
        const s = JSON.parse(rawStreak) as { current: number };
        setStreak(s.current || 0);
      } catch {}
    }

    const q = selectAdaptiveQuestion(gradeNum, language, sessions);
    setQuestion(q);
    const init: StoredDailyPractice = { question: q, answered: false };
    localStorage.setItem(storageKey, JSON.stringify(init));
  }, [gradeNum, language, storageKey, streakKey, sessions]);

  const handleSubmit = () => {
    if (!question) return;

    const isNumeric = question.type === 'number' || question.type === 'calculation';
    const res = isNumeric
      ? validateNumericAnswer(response, question.expectedAnswer)
      : validateAnswer(response, question.expectedAnswer, question.type);

    const didSucceed = res.isCorrect || res.confidence >= 75;

    // Update streak state on submit
    const newStreak = updateStreak(student.id);
    setStreak(newStreak.current);

    const msg = generateCompliment({
      correct: didSucceed,
      confidence: res.confidence,
      streak: newStreak.current,
      sessionType: question.sessionType,
    });

    setAnswered(true);
    setCorrect(didSucceed);
    setCompliment(msg);
    setReason(res.reason);

    // Persist
    const stored: StoredDailyPractice = {
      question,
      answered: true,
      response,
      correct: didSucceed,
      compliment: msg,
    };
    localStorage.setItem(storageKey, JSON.stringify(stored));

    // Server sync (non-blocking)
    const payload = {
      student_id: student.id,
      parent_id: profile?.id ?? null,
      parent_email: profile?.email ?? null,
      session_type: question.sessionType,
      question_text: question.text,
      expected_answer: question.expectedAnswer,
      response_text: response,
      correct: didSucceed,
      confidence: Math.round(res.confidence ?? 0),
      streak: newStreak.current,
    };
    (supabase as any)
      .from('daily_practice_attempts')
      .insert(payload)
      .then(({ error }: { error: any }) => {
        if (error) {
          console.error('Daily practice sync failed:', error);
        } else {
          toast({ title: 'Practice saved', description: 'Your daily attempt has been recorded.' });
        }
      })
      .catch((e: any) => console.error('Daily practice sync exception:', e));
  };

  if (!question) return null;

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Daily Practice
        </CardTitle>
        <CardDescription>
          One quick question to build confidence and routine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">For {student.name} • Grade {gradeNum} • {question.sessionType === 'dyscalculia' ? 'Math' : 'Reading'} • Streak {streak} days</span>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <p className="font-medium">{question.text}</p>
        </div>

        {answered ? (
          <div className="flex items-center gap-3">
            {correct ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Completed for today
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <XCircle className="h-4 w-4" /> Recorded — keep practicing
              </Badge>
            )}
          </div>
        ) : null}

        {!answered && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Type your answer here"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={!response.trim()}>
              Submit
            </Button>
          </div>
        )}

        {compliment && (
          <div className="mt-2 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold">{compliment}</p>
              {reason && <p className="text-xs text-muted-foreground mt-1">Feedback: {reason}</p>}
              <p className="text-xs text-muted-foreground mt-2">Come back tomorrow for a new question.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
