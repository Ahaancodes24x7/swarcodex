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
  Mail, Edit2, History, ExternalLink
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

const getScoreInterpretation = (score: number | null, sessionType: string, t: (key: string) => string): { text: string; variant: 'default' | 'secondary' | 'destructive' } => {
  if (score === null) return { text: '-', variant: 'secondary' };
  
  if (score >= 85) {
    return { text: t('score.excellent'), variant: 'default' };
  } else if (score >= 70) {
    return { text: t('score.good'), variant: 'default' };
  } else if (score >= 55) {
    return { text: t('score.moderate'), variant: 'secondary' };
  } else {
    return { 
      text: sessionType === 'dyslexia' ? t('score.concernDyslexia') : t('score.concernDyscalculia'), 
      variant: 'destructive' 
    };
  }
};

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
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [sessionType, setSessionType] = useState<'dyslexia' | 'dyscalculia'>('dyslexia');
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string>('');
  
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('');
  const [newStudentParentEmail, setNewStudentParentEmail] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editParentEmail, setEditParentEmail] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

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

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('teacher-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessment_sessions',
          filter: `teacher_id=eq.${profile.id}`,
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchStudents = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', profile.id);
      if (error) throw error;
      if (data) {
        setStudents(data.map(s => ({
          id: s.id,
          name: s.name,
          age: s.age,
          grade: Number.parseInt(s.grade || '1') || 1,
          parent_email: s.parent_email,
        })));
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSessions = async () => {
    if (!profile?.id) return;
    setSessionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessment_sessions')
        .select('*, students(name, grade)')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setSessions(data.map(s => ({
          id: s.id,
          student_id: s.student_id,
          session_type: s.session_type,
          status: s.status,
          overall_score: s.overall_score,
          flagged: s.flagged,
          created_at: s.created_at,
          studentName: (s.students as any)?.name || 'Unknown',
          studentGrade: Number.parseInt((s.students as any)?.grade || '1') || 1,
        })));
      }
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAddStudent = async () => {
    const name = newStudentName.trim();
    if (!name || !newStudentGrade) return;

    setIsAddingStudent(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({ 
          name, 
          age: newStudentAge ? Number.parseInt(newStudentAge) : null, 
          grade: newStudentGrade, 
          teacher_id: profile?.id,
          parent_email: newStudentParentEmail.trim() || null
        })
        .select()
        .single();
      if (error) throw error;
      setStudents([...students, { 
        id: data.id, 
        name: data.name, 
        age: data.age, 
        grade: Number.parseInt(data.grade || '1') || 1,
        parent_email: data.parent_email
      }]);
      setAddStudentDialogOpen(false);
      toast({ title: t('teacher.studentAdded') });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleUpdateParentEmail = async () => {
    if (!editingStudent) return;
    try {
      const { error } = await supabase
        .from('students')
        .update({ parent_email: editParentEmail.trim() || null })
        .eq('id', editingStudent.id);
      if (error) throw error;
      fetchStudents();
      setEditingStudent(null);
      toast({ title: 'Updated' });
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      const { error } = await supabase.from('students').delete().eq('id', studentToDelete.id);
      if (error) throw error;
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      setDeleteConfirmOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleStartSession = () => {
    if (!selectedStudent) return;
    const student = students.find(s => s.id === selectedStudent);
    const grade = selectedGrade || student?.grade || 1;
    setSessionDialogOpen(false);
    navigate(`/session?student=${selectedStudent}&type=${sessionType}&grade=${grade}&lang=${language}`);
  };

  const handleExportPDF = (session: Session) => {
    const interpretation = getScoreInterpretation(session.overall_score, session.session_type, t);
    downloadPDF({
      studentName: session.studentName || 'Unknown',
      studentGrade: session.studentGrade || 1,
      sessionType: session.session_type as 'dyslexia' | 'dyscalculia',
      date: new Date(session.created_at).toLocaleDateString(),
      responses: [],
      score: session.overall_score || 0,
      isFlagged: session.flagged || false,
      teacherName: profile?.full_name || undefined,
      interpretation: interpretation.text,
    });
  };

  const stats = {
    totalStudents: students.length,
    totalSessions: sessions.length,
    flaggedStudents: sessions.filter(s => s.flagged).length,
    avgScore: sessions.filter(s => s.status === 'completed').length > 0 
      ? Math.round(sessions.filter(s => s.status === 'completed').reduce((acc, s) => acc + (s.overall_score || 0), 0) / sessions.filter(s => s.status === 'completed').length) 
      : 0,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={swarLogo} alt="SWAR" className="h-10" />
            <div>
              <h1 className="text-xl font-bold">{t('teacher.dashboard')}</h1>
              <p className="text-sm text-muted-foreground">{t('dashboard.welcome')}, {profile?.full_name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />{t('dashboard.logout')}</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-4 flex items-center gap-4"><Users className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{stats.totalStudents}</p><p className="text-sm text-muted-foreground">{t('dashboard.students')}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><FileText className="h-6 w-6 text-chart-2" /><div><p className="text-2xl font-bold">{stats.totalSessions}</p><p className="text-sm text-muted-foreground">{t('dashboard.sessions')}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><AlertTriangle className="h-6 w-6 text-destructive" /><div><p className="text-2xl font-bold">{stats.flaggedStudents}</p><p className="text-sm text-muted-foreground">{t('teacher.flagged')}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><TrendingUp className="h-6 w-6 text-chart-3" /><div><p className="text-2xl font-bold">{stats.avgScore}%</p><p className="text-sm text-muted-foreground">{t('teacher.avgScore')}</p></div></CardContent></Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">{t('dashboard.students')}</TabsTrigger>
            <TabsTrigger value="reports">{t('dashboard.reports')}</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4 mr-2" />History</TabsTrigger>
            <TabsTrigger value="training"><BookOpen className="h-4 w-4 mr-2" />Training</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('dashboard.students')}</CardTitle>
                  <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
                    <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{t('teacher.addStudent')}</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input placeholder="Name" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} />
                        <Input type="number" placeholder="Age" value={newStudentAge} onChange={(e) => setNewStudentAge(e.target.value)} />
                        <Select onValueChange={setNewStudentGrade}><SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger><SelectContent>{Array.from({ length: 12 }, (_, i) => <SelectItem key={i+1} value={String(i+1)}>Grade {i+1}</SelectItem>)}</SelectContent></Select>
                        <Input placeholder="Parent Email" value={newStudentParentEmail} onChange={(e) => setNewStudentParentEmail(e.target.value)} />
                        <Button onClick={handleAddStudent} className="w-full">{isAddingStudent ? 'Adding...' : 'Add Student'}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-3">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div><p className="font-medium">{student.name}</p><p className="text-xs text-muted-foreground">Grade {student.grade}</p></div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedStudent(student.id); setSessionDialogOpen(true); }}><Play className="h-4 w-4 text-primary" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => openDeleteConfirm(student)}><AlertTriangle className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div><CardTitle>{t('dashboard.sessions')}</CardTitle></div>
                  <div className="flex gap-2">
                    <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
                      <DialogTrigger asChild><Button><Play className="h-4 w-4 mr-2" />{t('dashboard.startSession')}</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>New Voice Session</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                          <Select value={selectedStudent} onValueChange={setSelectedStudent}><SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
                          <Select value={sessionType} onValueChange={(v: any) => setSessionType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dyslexia">Dyslexia</SelectItem><SelectItem value="dyscalculia">Dyscalculia</SelectItem></SelectContent></Select>
                          <Button onClick={handleStartSession} className="w-full">Start Voice Test</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {/* REDIRECTION BUTTON FOR WRITTEN TEST */}
                    <Button 
                      variant="outline" 
                      onClick={() => window.open('https://jrqtpp3s-5000.inc1.devtunnels.ms/', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('dashboard.writtentest')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map(session => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {session.flagged ? <AlertTriangle className="text-destructive h-5 w-5" /> : <CheckCircle className="text-chart-3 h-5 w-5" />}
                          <div><p className="font-medium">{session.studentName}</p><p className="text-xs text-muted-foreground uppercase">{session.session_type}</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{session.overall_score}%</span>
                          <Button size="sm" variant="ghost" onClick={() => handleExportPDF(session)}><Download className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card><CardHeader><CardTitle>Progress Reports</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Select a student from the overview to view detailed trends.</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="history">
            <SessionHistory sessions={sessions} viewType="teacher" onExportPDF={handleExportPDF} />
          </TabsContent>

          <TabsContent value="training">
            <TeacherTraining />
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Student?</DialogTitle></DialogHeader>
          <p>This will remove all session data for {studentToDelete?.name}.</p>
          <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteStudent}>Delete</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
