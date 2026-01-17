import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Play, FileText, LogOut, Plus, TrendingUp,
  AlertTriangle, CheckCircle, Loader2, Download, BookOpen,
  Mail, Edit2, History
} from 'lucide-react';
import swarLogo from '@/assets/swar-logo.png';
import { downloadPDF } from '@/lib/pdfExport';
import TeacherTraining from '@/components/TeacherTraining';
import PracticeWorksheet from '@/components/PracticeWorksheet';
import ProgressChart from '@/components/ProgressChart';
import SessionHistory from '@/components/SessionHistory';

interface Student {
  id: string;
  name: string;
  age: number | null;
  grade: number;
  parent_email?: string | null;
}

interface Session {
  id: string;
  student_id: string;
  session_type: string;
  status: string;
  overall_score: number | null;
  flagged: boolean | null;
  created_at: string;
  studentName?: string;
  studentGrade?: number;
}

const TeacherDashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [sessionType, setSessionType] = useState<'dyslexia' | 'dyscalculia'>('dyslexia');

  // ✅ ADDED: written test redirect (ONLY ADDITION)
  const handleWrittenTestRedirect = () => {
    window.location.href = 'https://jrqtpp3s-5000.inc1.devtunnels.ms/';
  };

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'teacher')) {
      navigate('/auth?role=teacher');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (profile?.id) {
      fetchStudents();
      fetchSessions();
    }
  }, [profile?.id]);

  const fetchStudents = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', profile.id);

    if (data) {
      setStudents(data.map(s => ({
        id: s.id,
        name: s.name,
        age: s.age,
        grade: Number(s.grade || 1),
        parent_email: s.parent_email
      })));
    }
  };

  const fetchSessions = async () => {
    if (!profile?.id) return;
    setSessionsLoading(true);
    const { data } = await supabase
      .from('assessment_sessions')
      .select('*, students(name, grade)')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSessions(data.map(s => ({
        id: s.id,
        student_id: s.student_id,
        session_type: s.session_type,
        status: s.status,
        overall_score: s.overall_score,
        flagged: s.flagged,
        created_at: s.created_at,
        studentName: (s.students as any)?.name,
        studentGrade: Number((s.students as any)?.grade || 1)
      })));
    }
    setSessionsLoading(false);
  };

  const handleStartSession = () => {
    if (!selectedStudent) return;
    navigate(`/session?student=${selectedStudent}&type=${sessionType}&grade=${selectedGrade}&lang=${language}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <div className="flex items-center gap-3">
            <img src={swarLogo} alt="SWAR" className="h-10" />
            <div>
              <h1 className="text-xl font-bold">{t('teacher.dashboard')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.welcome')}, {profile?.full_name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('dashboard.logout')}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <Button>
            <Play className="h-4 w-4 mr-2" />
            {t('dashboard.startSession')}
          </Button>

          {/* ✅ ONLY MODIFIED BUTTON */}
          <Button onClick={handleWrittenTestRedirect}>
            <Play className="h-4 w-4 mr-2" />
            {t('dashboard.writtentest')}
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t('dashboard.students')}</TabsTrigger>
            <TabsTrigger value="reports">{t('dashboard.reports')}</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" /> Session History
            </TabsTrigger>
            <TabsTrigger value="training">
              <BookOpen className="h-4 w-4 mr-1" /> {t('training.title')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <p className="mt-6 text-muted-foreground">
              Dashboard loaded successfully.
            </p>
          </TabsContent>

          <TabsContent value="training">
            <TeacherTraining />
          </TabsContent>

          <TabsContent value="history">
            <SessionHistory sessions={sessions} viewType="teacher" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
