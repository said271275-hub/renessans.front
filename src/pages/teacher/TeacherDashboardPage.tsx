import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Users, CalendarCheck, Award, Calendar, Clock, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { Teacher, Group } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

interface TeacherProfileResponse {
  teacher: Teacher;
  stats: {
    totalGroups: number;
    totalStudents: number;
    averageAttendance: number;
    averageGrade: number;
    totalGradesGiven: number;
  };
}

export const TeacherDashboardPage: React.FC = () => {
  const [profileData, setProfileData] = useState<TeacherProfileResponse | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, groupsRes] = await Promise.all([
          api.get<TeacherProfileResponse>('/teacher/profile'),
          api.get<Group[]>('/teacher/groups'),
        ]);
        setProfileData(profileRes);
        setGroups(groupsRes);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Teacher Welcome Card */}
      <Card variant="raised">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center font-black text-2xl text-[var(--accent)]">
              {profileData?.teacher.user.fullName.charAt(0)}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                O'qituvchi Kabineti
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-0.5">
                Xush kelibsiz, {profileData?.teacher.user.fullName}!
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                Faningiz: <strong className="text-[var(--text-primary)]">{profileData?.teacher.subject}</strong> • Telefon: {profileData?.teacher.phone}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/teacher/attendance')}
              icon={<CalendarCheck className="w-4 h-4" />}
            >
              Bugungi davomat
            </Button>
            <Button
              variant="default"
              onClick={() => navigate('/teacher/grading')}
              icon={<Award className="w-4 h-4" />}
            >
              Baholash
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Biriktirilgan Guruhlar"
          value={profileData?.stats.totalGroups || 0}
          icon={<Layers className="w-6 h-6" />}
          subtitle="Siz dars beradigan guruhlar"
        />
        <StatCard
          title="Jami O'quvchilar"
          value={profileData?.stats.totalStudents || 0}
          icon={<Users className="w-6 h-6" />}
          subtitle="Guruhlaringizdagi shogirdlar"
        />
        <StatCard
          title="O'rtacha Davomat"
          value={`${profileData?.stats.averageAttendance || 0}%`}
          icon={<CalendarCheck className="w-6 h-6" />}
          subtitle="Darslarga qatnashish ko'rsatkichi"
        />
        <StatCard
          title="O'rtacha Baho"
          value={`${profileData?.stats.averageGrade || 0}`}
          icon={<Award className="w-6 h-6" />}
          subtitle="Jami qo'yilgan baholar: "
        />
      </div>

      {/* Assigned Groups Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Sizning guruhlaringiz</h3>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            Jami {groups.length} ta faol guruh
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} variant="raised" className="flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-[var(--accent)] font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">
                    {group.students?.length || 0} o'quvchi
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-[var(--text-primary)]">{group.name}</h4>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {group.schedule}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => navigate(`/teacher/attendance?groupId=${group.id}`)}
                  className="flex-1 text-xs"
                >
                  Davomat
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/teacher/grading?groupId=${group.id}`)}
                  className="flex-1 text-xs"
                >
                  Baholash
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
