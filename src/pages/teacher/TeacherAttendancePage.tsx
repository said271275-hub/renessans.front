import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCheck, Save, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Group, Attendance, AttendanceStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker, getLocalDateString } from '../../components/ui/DatePicker';

const getScheduleTypeForDate = (date: string): 'ODD' | 'EVEN' | null => {
  if (!date) return null;
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  if ([1, 3, 5].includes(weekday)) return 'ODD';
  if ([2, 4, 6].includes(weekday)) return 'EVEN';
  return null;
};

export const TeacherAttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
  const selectedScheduleType = getScheduleTypeForDate(selectedDate);

  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>({});
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const availableGroups = useMemo(
    () => groups.filter(group => selectedScheduleType !== null && group.scheduleType === selectedScheduleType),
    [groups, selectedScheduleType],
  );
  const students = useMemo(
    () => groups
      .find(group => group.id === Number(selectedGroupId))
      ?.students?.filter(student => student.groupId === Number(selectedGroupId)) ?? [],
    [groups, selectedGroupId],
  );

  // 1. Fetch Teacher's groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await api.get<Group[]>('/teacher/groups');
        setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGroupsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (isGroupsLoading) return;
    if (availableGroups.some(group => String(group.id) === selectedGroupId)) return;
    setSelectedGroupId(String(availableGroups[0]?.id ?? ''));
  }, [availableGroups, isGroupsLoading, selectedGroupId]);

  // 2. When selectedGroupId or selectedDate changes, fetch group students & existing attendance
  useEffect(() => {
    if (
      !selectedGroupId ||
      !selectedDate ||
      !availableGroups.some(group => String(group.id) === selectedGroupId)
    ) {
      setAttendanceMap({});
      setIsLoading(false);
      return;
    }

    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        // Find selected group from state or refetch
        const currentGroup = groups.find((g) => g.id === Number(selectedGroupId));
        const groupStudents = currentGroup?.students?.filter(
          student => student.groupId === Number(selectedGroupId),
        ) || [];

        // Fetch existing attendance records for this group & date
        const existingRecords = await api.get<Attendance[]>('/teacher/attendance', {
          groupId: selectedGroupId,
          date: selectedDate,
        });

        // Populate attendanceMap with existing or default
        const newMap: Record<number, AttendanceStatus> = {};
        groupStudents.forEach((student) => {
          const found = existingRecords.find((r) => r.studentId === student.id);
          newMap[student.id] = found ? found.status : 'KELDI';
        });

        setAttendanceMap(newMap);
      } catch (err: any) {
        setErrorMessage(err.message || 'Davomat ma\'lumotlarini yuklashda xatolik.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedGroupId, selectedDate, groups, availableGroups]);

  // Set single student status
  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setSuccessMessage(null);
  };

  // "Hammasini keldi deb belgilash"
  const markAllAsPresent = () => {
    const updatedMap: Record<number, AttendanceStatus> = {};
    students.forEach(student => { updatedMap[student.id] = 'KELDI'; });
    setAttendanceMap(updatedMap);
    setSuccessMessage('Barcha o\'quvchilar "Keldi" deb belgilandi. Saqlash tugmasini bosing.');
  };

  const markAllAsAbsent = () => {
    const updatedMap: Record<number, AttendanceStatus> = {};
    students.forEach(student => { updatedMap[student.id] = 'KELMADI'; });
    setAttendanceMap(updatedMap);
    setSuccessMessage('Barcha o\'quvchilar "Kelmadi" deb belgilandi. Saqlash tugmasini bosing.');
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (!selectedGroupId || !selectedDate || isLoading) return;

    try {
      setIsSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const records = students
        .filter(student => student.groupId === Number(selectedGroupId))
        .map(student => ({
          studentId: student.id,
          status: attendanceMap[student.id] || 'KELDI',
        }));

      await api.post('/teacher/attendance', {
        groupId: Number(selectedGroupId),
        date: selectedDate,
        records,
      });

      setSuccessMessage('Davomat muvaffaqiyatli saqlandi!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Davomatni saqlashda xatolik yuz berdi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculation of present vs total
  const stats = React.useMemo(() => {
    const total = students.length;
    let keldi = 0, kelmadi = 0, kechikdi = 0, sababli = 0;
    Object.values(attendanceMap).forEach((st) => {
      if (st === 'KELDI') keldi++;
      else if (st === 'KELMADI') kelmadi++;
      else if (st === 'KECHIKDI') kechikdi++;
      else if (st === 'SABABLI') sababli++;
    });
    return { total, keldi, kelmadi, kechikdi, sababli };
  }, [students, attendanceMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Davomat belgilash</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Darsda qatnashayotgan shogirdlaringiz davomatini belgilang va saqlang
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="default"
            onClick={markAllAsPresent}
            disabled={students.length === 0 || isLoading}
            icon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
            className="shadow-[var(--shadow-raised-sm)]"
          >
            Hammasini keldi deb belgilash
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={markAllAsAbsent}
            disabled={students.length === 0 || isLoading}
            icon={<XCircle className="w-4 h-4 text-rose-600" />}
            className="shadow-[var(--shadow-raised-sm)]"
          >
            Hammasini kelmadi deb belgilash
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAttendance}
            isLoading={isSaving}
            disabled={students.length === 0 || isLoading}
            icon={<Save className="w-4 h-4" />}
            className="shadow-[var(--shadow-raised)]"
          >
            Saqlash
          </Button>
        </div>
      </div>

      {/* Notifications */}
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
      {!isGroupsLoading && availableGroups.length === 0 && (
        <div className="rounded-2xl neu-inset p-4 text-sm font-semibold text-[var(--text-secondary)]">
          Tanlangan sana haftasiga mos guruhlar mavjud emas.
        </div>
      )}

      {/* Group & Date Selection Card */}
      <Card variant="raised-sm" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            label="Guruhni tanlang"
            value={selectedGroupId}
            onValueChange={(groupId) => {
              setSelectedGroupId(groupId);
              setAttendanceMap({});
              setIsLoading(true);
            }}
          >
            {availableGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.students?.length || 0} o'quvchi)
              </option>
            ))}
          </Select>

          <DatePicker
            label="Dars sanasi"
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setAttendanceMap({});
              setIsLoading(true);
            }}
          />

          <div className="flex flex-col justify-end">
            <div className="p-2.5 rounded-xl neu-inset flex items-center justify-around text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Keldi: {stats.keldi}
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                Kelmadi: {stats.kelmadi}
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                Kechikdi: {stats.kechikdi}
              </span>
              <span className="text-sky-600 dark:text-sky-400">
                Sababli: {stats.sababli}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Students Attendance List */}
      <Card variant="raised" className="p-0 overflow-hidden">
        {students.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)]">
            <p className="text-sm font-medium">
              {selectedGroupId
                ? "Ushbu guruhda o'quvchilar mavjud emas."
                : 'Davomat uchun guruh tanlanmagan.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            <div className="py-3 px-6 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <span>O'quvchi (F.I.SH.)</span>
              <span>Davomat holati</span>
            </div>

            {students.map((student, idx) => {
              const currentStatus = attendanceMap[student.id] || 'KELDI';
              return (
                <div
                  key={student.id}
                  className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--text-muted)] w-5">
                      {idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded-xl neu-raised flex items-center justify-center font-bold text-xs text-[var(--accent)]">
                      {student.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {student.fullName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">
                        {student.phone}
                      </p>
                    </div>
                  </div>

                  {/* 4 Status Buttons for each student */}
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
                    {/* KELDI */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'KELDI')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentStatus === 'KELDI'
                          ? 'neu-inset text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 shadow-[var(--shadow-inset)]'
                          : 'neu-button text-[var(--text-secondary)] hover:text-emerald-600'
                      }`}
                    >
                      Keldi
                    </button>

                    {/* KELMADI */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'KELMADI')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentStatus === 'KELMADI'
                          ? 'neu-inset text-rose-700 dark:text-rose-400 bg-rose-500/20 border border-rose-500/40 shadow-[var(--shadow-inset)]'
                          : 'neu-button text-[var(--text-secondary)] hover:text-rose-600'
                      }`}
                    >
                      Kelmadi
                    </button>

                    {/* KECHIKDI */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'KECHIKDI')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentStatus === 'KECHIKDI'
                          ? 'neu-inset text-amber-700 dark:text-amber-400 bg-amber-500/20 border border-amber-500/40 shadow-[var(--shadow-inset)]'
                          : 'neu-button text-[var(--text-secondary)] hover:text-amber-600'
                      }`}
                    >
                      Kechikdi
                    </button>

                    {/* SABABLI */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'SABABLI')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentStatus === 'SABABLI'
                          ? 'neu-inset text-sky-700 dark:text-sky-400 bg-sky-500/20 border border-sky-500/40 shadow-[var(--shadow-inset)]'
                          : 'neu-button text-[var(--text-secondary)] hover:text-sky-600'
                      }`}
                    >
                      Sababli
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
