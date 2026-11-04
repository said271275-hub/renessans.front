import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, Layers, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { DashboardStats } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<DashboardStats>('/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Statistika xatosi:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Jami O'quvchilar"
          value={stats?.studentsCount || 0}
          icon={<Users className="w-6 h-6" />}
          subtitle="Faol ro'yxatdan o'tganlar"
        />
        <StatCard
          title="O'qituvchilar"
          value={stats?.teachersCount || 0}
          icon={<GraduationCap className="w-6 h-6" />}
          subtitle="Mutaxassis murabbiylar"
        />
        <StatCard
          title="Guruhlar soni"
          value={stats?.groupsCount || 0}
          icon={<Layers className="w-6 h-6" />}
          subtitle="Faol dars guruhlari"
        />
      </div>

      <Card variant="raised">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base">Bugungi guruhlar davomati</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {stats?.todayScheduleType === 'ODD'
                ? 'Toq kunlar — dushanba, chorshanba va juma'
                : stats?.todayScheduleType === 'EVEN'
                  ? 'Juft kunlar — seshanba, payshanba va shanba'
                  : 'Yakshanba kuni darslar rejalashtirilmagan'}
            </p>
          </div>
          {stats?.todayScheduleType && (
            <span className="rounded-xl bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-bold text-[var(--accent)]">
              {stats.todayScheduleType === 'ODD' ? 'Toq kunlar' : 'Juft kunlar'}
            </span>
          )}
        </div>
        {stats?.groupAttendance.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {stats.groupAttendance.map(group => (
              <div key={group.groupId} className="neu-inset rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{group.name}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {group.presentStudents} / {group.totalStudents} o'quvchi qatnashdi
                    </p>
                  </div>
                  <span className="shrink-0 text-lg font-extrabold text-[var(--accent)]">
                    {group.percentage}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                  Davomat qayd etildi: {group.markedStudents} / {group.totalStudents}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl neu-inset py-6 text-center text-sm text-[var(--text-muted)]">
            Bugungi jadval bo'yicha guruhlar mavjud emas
          </p>
        )}
      </Card>

      {/* Today Attendance Breakdown */}
      <Card variant="raised">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">Bugungi davomat taqsimoti</h3>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            Jami qayd etilganlar: {
              (stats?.statusCounts.keldi || 0) +
              (stats?.statusCounts.kelmadi || 0) +
              (stats?.statusCounts.kechikdi || 0) +
              (stats?.statusCounts.sababli || 0)
            }
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl neu-inset flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-semibold">Keldi</p>
              <p className="text-xl font-extrabold">{stats?.statusCounts.keldi || 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl neu-inset flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-semibold">Kelmadi</p>
              <p className="text-xl font-extrabold">{stats?.statusCounts.kelmadi || 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl neu-inset flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-semibold">Kechikdi</p>
              <p className="text-xl font-extrabold">{stats?.statusCounts.kechikdi || 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl neu-inset flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center text-sky-600 dark:text-sky-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-semibold">Sababli</p>
              <p className="text-xl font-extrabold">{stats?.statusCounts.sababli || 0}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Two columns: Recent Students and Recent Attendances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card variant="raised">
          <h3 className="font-bold text-base mb-4">So'nggi qo'shilgan o'quvchilar</h3>
          <div className="space-y-3">
            {stats?.recentStudents && stats.recentStudents.length > 0 ? (
              stats.recentStudents.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl neu-inset flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl neu-raised flex items-center justify-center font-bold text-xs text-[var(--accent)]">
                      {s.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{s.fullName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{s.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">
                    {s.group?.name || 'Guruhsiz'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">O'quvchilar mavjud emas</p>
            )}
          </div>
        </Card>

        {/* Recent Attendance */}
        <Card variant="raised">
          <h3 className="font-bold text-base mb-4">So'nggi belgilangan davomatlar</h3>
          <div className="space-y-3">
            {stats?.recentAttendances && stats.recentAttendances.length > 0 ? (
              stats.recentAttendances.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl neu-inset flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{a.student.fullName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {a.group.name} • {a.date}
                    </p>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">Davomat yozuvlari mavjud emas</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
