import React, { useEffect, useState } from 'react';
import { Calendar, Filter, Users, GraduationCap, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Attendance, Group, Teacher } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const AdminAttendancePage: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const fetchFiltersData = async () => {
    try {
      const [groupsData, teachersData] = await Promise.all([
        api.get<Group[]>('/admin/groups'),
        api.get<Teacher[]>('/admin/teachers'),
      ]);
      setGroups(groupsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendances = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Attendance[]>('/admin/attendance', {
        groupId: selectedGroup,
        teacherId: selectedTeacher,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setAttendances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchAttendances();
    setCurrentPage(1);
  }, [selectedGroup, selectedTeacher, startDate, endDate]);

  // Statistics calculation for the filtered attendances
  const stats = React.useMemo(() => {
    const total = attendances.length;
    const keldi = attendances.filter(a => a.status === 'KELDI').length;
    const kelmadi = attendances.filter(a => a.status === 'KELMADI').length;
    const kechikdi = attendances.filter(a => a.status === 'KECHIKDI').length;
    const sababli = attendances.filter(a => a.status === 'SABABLI').length;
    const rate = total > 0 ? Math.round(((keldi + kechikdi) / total) * 100) : 0;
    return { total, keldi, kelmadi, kechikdi, sababli, rate };
  }, [attendances]);

  // Pagination
  const paginatedAttendances = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return attendances.slice(start, start + pageSize);
  }, [attendances, currentPage]);

  const totalPages = Math.ceil(attendances.length / pageSize) || 1;

  const columns: Column<Attendance>[] = [
    {
      header: 'O\'quvchi',
      accessor: (a) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl neu-raised flex items-center justify-center font-bold text-xs text-[var(--accent)]">
            {a.student?.fullName?.charAt(0) || 'O'}
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--text-primary)]">{a.student?.fullName}</p>
            <p className="text-xs text-[var(--text-muted)] font-mono">{a.student?.phone}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Guruh',
      accessor: (a) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">
          {a.group?.name}
        </span>
      ),
    },
    {
      header: 'Sana',
      accessor: (a) => (
        <span className="text-xs font-mono font-medium text-[var(--text-secondary)]">
          {a.date}
        </span>
      ),
    },
    {
      header: 'Belgilagan o\'qituvchi',
      accessor: (a) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {a.markedByTeacher?.user.fullName || 'Ustoz'}
        </span>
      ),
    },
    {
      header: 'Holat',
      accessor: (a) => <Badge status={a.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Davomat nazorati</h2>
        <p className="text-xs text-[var(--text-secondary)]">
          O'qituvchilar tomonidan darslarda belgilangan real davomat jurnali
        </p>
      </div>

      {/* Filter Bar */}
      <Card variant="raised-sm" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Guruh bo'yicha"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>

          <Select
            label="O'qituvchi bo'yicha"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">Barcha o'qituvchilar</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.user.fullName} ({t.subject})
              </option>
            ))}
          </Select>

          <Input
            label="Boshlang'ich sana"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="Tugash sanasi"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Quick Summary Pill Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-2xl neu-inset text-center">
          <p className="text-xs text-[var(--text-secondary)] font-semibold">Jami yozuvlar</p>
          <p className="text-lg font-extrabold">{stats.total}</p>
        </div>
        <div className="p-3 rounded-2xl neu-inset text-center">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Keldi</p>
          <p className="text-lg font-extrabold">{stats.keldi}</p>
        </div>
        <div className="p-3 rounded-2xl neu-inset text-center">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Kelmadi</p>
          <p className="text-lg font-extrabold">{stats.kelmadi}</p>
        </div>
        <div className="p-3 rounded-2xl neu-inset text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Kechikdi</p>
          <p className="text-lg font-extrabold">{stats.kechikdi}</p>
        </div>
        <div className="p-3 rounded-2xl neu-inset text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">Sababli</p>
          <p className="text-lg font-extrabold">{stats.sababli}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <Table
        data={paginatedAttendances}
        columns={columns}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage="Belgilangan parametrlar bo'yicha davomat topilmadi"
      />
    </div>
  );
};
