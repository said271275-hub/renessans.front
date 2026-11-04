import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Star, CheckCircle2, AlertCircle, Plus, Send, History } from 'lucide-react';
import { api } from '../../api/client';
import { Group, Student, Grade } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';

export const TeacherGradingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId);
  const [students, setStudents] = useState<Student[]>([]);

  // Grade Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [score, setScore] = useState<string>('90');
  const [comment, setComment] = useState<string>('Darsda juda faol qatnashdi');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [gradesHistory, setGradesHistory] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await api.get<Group[]>('/teacher/groups');
        setGroups(data);
        if (data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(String(data[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  // Update students when group changes
  useEffect(() => {
    if (!selectedGroupId) return;
    const currentGroup = groups.find((g) => g.id === Number(selectedGroupId));
    const groupStudents = currentGroup?.students || [];
    setStudents(groupStudents);
    if (groupStudents.length > 0) {
      setSelectedStudentId(String(groupStudents[0].id));
    } else {
      setSelectedStudentId('');
    }
  }, [selectedGroupId, groups]);

  // Fetch Teacher's recent grades
  const fetchGradesHistory = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Grade[]>('/teacher/grades');
      setGradesHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGradesHistory();
  }, []);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !score || !date) {
      setErrorMessage('Iltimos, o\'quvchi, baho va sanani to\'ldiring.');
      return;
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 100) {
      setErrorMessage('Baho 1 dan 100 gacha bo\'lishi kerak.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await api.post('/teacher/grades', {
        studentId: Number(selectedStudentId),
        score: numScore,
        comment: comment.trim(),
        date,
      });

      setSuccessMessage('Baho muvaffaqiyatli saqlandi va o\'quvchi reytingiga qo\'shildi!');
      setTimeout(() => setSuccessMessage(null), 4000);

      // Refresh history
      fetchGradesHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Bahoni saqlashda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Grade>[] = [
    {
      header: 'O\'quvchi',
      accessor: (g) => (
        <div>
          <p className="font-bold text-sm text-[var(--text-primary)]">{g.student?.fullName}</p>
          <p className="text-xs text-[var(--text-muted)]">{g.student?.group?.name || 'Guruh'}</p>
        </div>
      ),
    },
    {
      header: 'Baho (Ball)',
      accessor: (g) => (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/15 text-amber-700 dark:text-amber-400 font-black text-sm border border-amber-400/30">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          {g.score}
        </div>
      ),
    },
    {
      header: 'Izoh',
      accessor: (g) => <span className="text-xs text-[var(--text-secondary)]">{g.comment || '-'}</span>,
    },
    {
      header: 'Sana',
      accessor: (g) => <span className="text-xs font-mono text-[var(--text-muted)]">{g.date}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">O'quvchilarni baholash</h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Dars natijalari bo'yicha baholang. Ushbu ballar to'g'ridan-to'g'ri o'quvchilar reytingida aks etadi
        </p>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl neu-inset bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl neu-inset bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Grade Entry Form */}
      <Card variant="raised-lg">
        <form onSubmit={handleGradeSubmit} className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
            <Award className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-bold text-base">Yangi baho qo'yish</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              label="1. Guruhni tanlang"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>

            <Select
              label="2. O'quvchini tanlang"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={students.length === 0}
            >
              {students.length === 0 ? (
                <option value="">O'quvchilar yo'q</option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))
              )}
            </Select>

            <Input
              label="3. Baho (1 - 100 ball)"
              type="number"
              min={1}
              max={100}
              placeholder="Masalan: 95"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />

            <Input
              label="4. Dars sanasi"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="O'qituvchi izohi / Sharhi"
            placeholder="Masalan: Mavzuni a'lo darajada o'zlashtirdi va barcha topshiriqlarni mustaqil bajardi"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={students.length === 0}
              icon={<Send className="w-4 h-4" />}
              className="shadow-[var(--shadow-raised)]"
            >
              Bahoni kiritish va saqlash
            </Button>
          </div>
        </form>
      </Card>

      {/* History of Grades Given */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--accent)]" /> So'nggi qo'yilgan baholar tarixi
          </h3>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            Jami {gradesHistory.length} ta baho
          </span>
        </div>

        <Table
          data={gradesHistory}
          columns={columns}
          keyExtractor={(g) => g.id}
          isLoading={isLoading}
          emptyMessage="Siz tomoningizdan hali baholar qo'yilmagan"
        />
      </div>
    </div>
  );
};
