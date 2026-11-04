import React from 'react';
import { AttendanceStatus, UserRole } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'keldi' | 'kelmadi' | 'kechikdi' | 'sababli' | 'admin' | 'manager' | 'teacher' | 'gold' | 'silver' | 'bronze';
  status?: AttendanceStatus;
  role?: UserRole;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  role,
  className = '',
}) => {
  let resolvedVariant = variant || 'default';

  if (status) {
    if (status === 'KELDI') resolvedVariant = 'keldi';
    else if (status === 'KELMADI') resolvedVariant = 'kelmadi';
    else if (status === 'KECHIKDI') resolvedVariant = 'kechikdi';
    else if (status === 'SABABLI') resolvedVariant = 'sababli';
  }

  if (role) {
    if (role === 'ADMIN') resolvedVariant = 'admin';
    else if (role === 'MANAGER') resolvedVariant = 'manager';
    else if (role === 'TEACHER') resolvedVariant = 'teacher';
  }

  const styles = {
    default: 'bg-black/5 dark:bg-white/5 text-[var(--text-primary)]',
    keldi: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    kelmadi: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20',
    kechikdi: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    sababli: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/20',
    admin: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-bold',
    manager: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-bold',
    teacher: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-bold',
    gold: 'bg-amber-400/25 text-amber-800 dark:text-amber-200 border border-amber-400/40 font-bold',
    silver: 'bg-slate-400/25 text-slate-700 dark:text-slate-200 border border-slate-400/40 font-bold',
    bronze: 'bg-amber-700/20 text-amber-900 dark:text-amber-300 border border-amber-700/40 font-bold',
  }[resolvedVariant];

  const statusLabel = {
    KELDI: 'Keldi',
    KELMADI: 'Kelmadi',
    KECHIKDI: 'Kechikdi',
    SABABLI: 'Sababli',
  };

  const roleLabel = {
    ADMIN: 'Admin',
    MANAGER: 'Menejer',
    TEACHER: 'O\'qituvchi',
  };

  const content = children || (status ? statusLabel[status] : role ? roleLabel[role] : null);

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full neu-inset-sm select-none ${styles} ${className}`}
    >
      {content}
    </span>
  );
};
