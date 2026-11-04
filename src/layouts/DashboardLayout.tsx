import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  DollarSign,
  Trophy,
  Award,
  LogOut,
  Menu,
  X,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define nav links per role
  let navItems: NavItem[] = [];

  if (user?.role === 'ADMIN') {
    navItems = [
      { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
      { to: '/admin/students', label: 'O\'quvchilar', icon: <Users className="w-5 h-5" /> },
      { to: '/admin/teachers', label: 'O\'qituvchilar', icon: <GraduationCap className="w-5 h-5" /> },
      { to: '/admin/groups', label: 'Guruhlar', icon: <Layers className="w-5 h-5" /> },
      { to: '/admin/attendance', label: 'Davomat', icon: <CalendarCheck className="w-5 h-5" /> },
    ];
  } else if (user?.role === 'MANAGER') {
    navItems = [
      { to: '/manager', label: 'Umumiy ko\'rinish', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
      { to: '/manager/finance', label: 'Moliya', icon: <DollarSign className="w-5 h-5" /> },
      { to: '/manager/ratings', label: 'O\'quvchilar reytingi', icon: <Trophy className="w-5 h-5" /> },
    ];
  } else if (user?.role === 'TEACHER') {
    navItems = [
      { to: '/teacher', label: 'Bosh sahifa', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
      { to: '/teacher/attendance', label: 'Davomat belgilash', icon: <CalendarCheck className="w-5 h-5" /> },
      { to: '/teacher/grading', label: 'Baholash', icon: <Award className="w-5 h-5" /> },
    ];
  }

  // Get active title
  const currentNav = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const pageTitle = currentNav?.label || 'Boshqaruv Paneli';
  const pathParts = location.pathname.split('/').filter(Boolean);
  const roleBasePath = `/${pathParts[0]}`;
  const isNestedPage = pathParts.length > 1;
  const backFallback = pathParts.length > 2
    ? `${roleBasePath}/${pathParts[1]}`
    : roleBasePath;

  const goBack = () => {
    const historyState = window.history.state as { idx?: number } | null;
    if (typeof historyState?.idx === 'number' && historyState.idx > 0) {
      navigate(-1);
    } else {
      navigate(backFallback);
    }
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-primary)]">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 p-6 flex flex-col justify-between neu-raised border-r border-[var(--border-subtle)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl neu-inset flex items-center justify-center text-[var(--accent)] dark:text-[#D4AF37] font-black text-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight leading-tight dark:text-[#D4AF37]">RENESANS</h1>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">O'quv Markazi</p>
              </div>
            </div>
            <button
              onClick={closeMobile}
              className="lg:hidden p-1.5 rounded-xl neu-button text-[var(--text-secondary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User role pill info */}
          <div className="p-3 neu-inset rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center font-bold text-[var(--accent)] text-sm">
              {user?.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.fullName}</p>
              <div className="mt-0.5">
                <Badge role={user?.role} />
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-2 pt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'neu-inset text-[var(--text-primary)] font-bold shadow-[var(--shadow-inset)]'
                      : 'hover:neu-raised-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <Button
            variant="danger"
            size="md"
            onClick={logout}
            className="w-full justify-start gap-3"
            icon={<LogOut className="w-4 h-4" />}
          >
            Chiqish
          </Button>
          <p className="text-[10px] text-center text-[var(--text-muted)] font-medium">
            Renesans LMS v1.0 • Neumorphic Soft UI
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-20 px-6 sm:px-8 neu-raised border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl neu-button text-[var(--text-primary)]"
              aria-label="Menyu ochish"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.18em] text-[var(--text-secondary)] dark:text-[#D4AF37]">
                RENESANS
              </p>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {pageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {isNestedPage && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={goBack}
                icon={<ArrowLeft className="h-4 w-4" />}
                aria-label="Orqaga"
              >
                Orqaga
              </Button>
            )}
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[var(--border-subtle)]">
              <div className="text-right">
                <p className="text-xs font-bold leading-tight">{user?.fullName}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{user?.login}</p>
              </div>
              <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center font-bold text-sm text-[var(--accent)]">
                {user?.fullName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
