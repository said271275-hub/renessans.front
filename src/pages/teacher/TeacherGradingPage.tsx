import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Star, CheckCircle2, AlertCircle, Send, History } from 'lucide-react';
import { api } from '../../api/client';
import { Group, Student, Grade } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { DatePicker, getLocalDateString } from '../../components/ui/DatePicker';
import { Table, Column } from '../../components/ui/Table';

export const TeacherGradingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId);
  const [students, setStudents] = useState<Student[]>([]);

  const [gradeEntries, setGradeEntries] = useState<Record<number, { score: string; comment: string }>>({});
  const [date, setDate] = useState<string>(getLocalDateString(new Date()));

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
    const currentGroup = groups.find((g) => g.id === Number(selectedGroupId));
    const groupStudents = currentGroup?.students?.filter(student => student.groupId === currentGroup.id) || [];
    setStudents(groupStudents);
    setGradeEntries({});
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
    if (!selectedGroupId || !date || students.length === 0) {
      setErrorMessage('Iltimos, guruh, o\'quvchilar va sanani tanlang.');
      return;
    }

    const invalidStudent = students.find(student => {
      const score = gradeEntries[student.id]?.score.trim();
      return score !== undefined && score !== '' &&
        (!Number.isInteger(Number(score)) || Number(score) < 1 || Number(score) > 100);
    });
    if (invalidStudent) {
      setErrorMessage(`${invalidStudent.fullName} uchun baho 1 dan 100 gacha butun son bo'lishi kerak.`);
      return;
    }

    const grades = students.flatMap(student => {
      const entry = gradeEntries[student.id];
      const score = entry?.score.trim();
      if (!score) return [];
      return [{
        studentId: student.id,
        score: Number(score),
        comment: entry.comment.trim(),
      }];
    });

    if (grades.length === 0) {
      setErrorMessage(null);
      setSuccessMessage('Baho kiritilmagani uchun barcha bo\'sh baholar o\'tkazib yuborildi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await api.post('/teacher/grades/bulk', {
        groupId: Number(selectedGroupId),
        date,
        grades,
      });

      const skippedCount = students.length - grades.length;
      setSuccessMessage(
        `${grades.length} ta baho saqlandi.${skippedCount > 0 ? ` ${skippedCount} ta bo'sh baho o'tkazib yuborildi.` : ''}`,
      );
      setGradeEntries({});
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchGradesHistory();
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
            <h3 className="font-bold text-base">Guruhni baholash</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Guruhni tanlang"
              value={selectedGroupId}
              onValueChange={groupId => {
                setSelectedGroupId(groupId);
                setGradeEntries({});
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>

            <DatePicker
              label="Dars sanasi"
              value={date}
              onChange={setDate}
              required
            />
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Baho kiritilmagan o'quvchilar saqlash vaqtida o'tkazib yuboriladi.
          </p>

          <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {students.length === 0 ? (
              <p className="rounded-xl neu-inset p-4 text-sm text-[var(--text-muted)]">
                Tanlangan guruhda o'quvchilar mavjud emas.
              </p>
            ) : students.map(student => (
              <div
                key={student.id}
                className="grid grid-cols-1 gap-3 rounded-2xl neu-inset p-4 md:grid-cols-[minmax(0,1.2fr)_9rem_minmax(0,1.8fr)] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                    {student.fullName}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{student.phone}</p>
                </div>
                <Input
                  label="Baho (1-100)"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  placeholder="Bo'sh qoldirish mumkin"
                  value={gradeEntries[student.id]?.score ?? ''}
                  onChange={event => setGradeEntries(current => ({
                    ...current,
                    [student.id]: {
                      ...(current[student.id] ?? { score: '', comment: '' }),
                      score: event.target.value,
                    },
                  }))}
                />
                <Input
                  label="Izoh (ixtiyoriy)"
                  placeholder="Izoh kiriting"
                  value={gradeEntries[student.id]?.comment ?? ''}
                  onChange={event => setGradeEntries(current => ({
                    ...current,
                    [student.id]: {
                      ...(current[student.id] ?? { score: '', comment: '' }),
                      comment: event.target.value,
                    },
                  }))}
                />
              </div>
            ))}
          </div>

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
              Baholarni saqlash
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
