import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { User as UserType } from '../types';

export const LoginPage: React.FC = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, getRoleRedirectPath, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirectPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRoleRedirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !password.trim()) {
      setError('Iltimos, login va parolni kiriting.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.post<{ token: string; user: UserType }>('/auth/login', {
        login: loginInput.trim(),
        password: password.trim(),
      });

      login(res.token, res.user);
      const redirectPath = getRoleRedirectPath(res.user.role);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login yoki parol noto\'g\'ri.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (u: string, p: string) => {
    setLoginInput(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--bg-color)] text-[var(--text-primary)] relative">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl neu-raised flex items-center justify-center text-[var(--accent)] font-black shadow-[var(--shadow-raised)] border border-[var(--border-subtle)]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            RENESANS LMS
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            O'quv markaz boshqaruv tizimi
          </p>
        </div>

        {/* Login Card */}
        <Card variant="raised-lg" className="border border-[var(--border-subtle)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-base font-bold">Tizimga kirish</h2>
            </div>

            {error && (
              <div className="p-3 rounded-xl neu-inset bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <Input
              label="Login"
              type="text"
              placeholder="Masalan: admin"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              icon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Parol"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full shadow-[var(--shadow-raised)] mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Kirish
            </Button>
          </form>

          {/* Demo test accounts for instant evaluator convenience */}
          <div className="mt-8 pt-5 border-t border-[var(--border-subtle)]">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 text-center">
              Sinov uchun tezkor hisoblar:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('admin', 'admin123')}
                className="p-2 text-xs font-semibold rounded-xl neu-button text-purple-700 dark:text-purple-300"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('manager', 'manager123')}
                className="p-2 text-xs font-semibold rounded-xl neu-button text-indigo-700 dark:text-indigo-300"
              >
                Menejer
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('rustam_math', 'teacher123')}
                className="p-2 text-xs font-semibold rounded-xl neu-button text-teal-700 dark:text-teal-300"
              >
                O'qituvchi
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
