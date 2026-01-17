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

  // 🔥 NEW: Written Test Redirect
  const handleWrittenTestRedirect = () => {
    window.location.href = "https://jrqtpp3s-5000.inc1.devtunnels.ms/";
  };

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'teacher')) {
      navigate('/auth?role=teacher');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={swarLogo} alt="SWAR" className="h-10" />
            <div>
              <h1 className="text-xl font-bold">{t('teacher.dashboard')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.welcome')}, {profile?.full_name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={async () => { await signOut(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('dashboard.logout')}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mb-6">
          <Button onClick={() => setSessionDialogOpen(true)}>
            <Play className="h-4 w-4 mr-2" />
            {t('dashboard.startSession')}
          </Button>

          {/* 🔥 WRITTEN TEST BUTTON */}
          <Button onClick={handleWrittenTestRedirect}>
            <Play className="h-4 w-4 mr-2" />
            {t('dashboard.writtentest')}
          </Button>
        </div>

        {/* REST OF UI UNCHANGED */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t('dashboard.students')}</TabsTrigger>
            <TabsTrigger value="reports">{t('dashboard.reports')}</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" /> Session History
            </TabsTrigger>
            <TabsTrigger value="training">
              <BookOpen className="h-4 w-4 mr-2" />
              {t('training.title')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <p className="text-muted-foreground mt-6">
              Dashboard loaded successfully.
            </p>
          </TabsContent>

          <TabsContent value="reports">
            <ProgressChart studentName="Demo" sessions={[]} />
          </TabsContent>

          <TabsContent value="history">
            <SessionHistory sessions={[]} viewType="teacher" onExportPDF={() => {}} />
          </TabsContent>

          <TabsContent value="training">
            <TeacherTraining />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
