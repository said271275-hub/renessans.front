import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

export const getLocalDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  className = '',
  id,
  required = false,
  disabled = false,
}) => {
  const today = getLocalDateString(new Date());
  const parsedValue = value ? parseDate(value) : null;
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = parsedValue || new Date();
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  useEffect(() => {
    if (parsedValue) setVisibleMonth(new Date(parsedValue.getFullYear(), parsedValue.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) =>
      new Date(year, month, index - firstWeekday + 1),
    );
  }, [visibleMonth]);

  const chooseDate = (date: Date) => {
    onChange(getLocalDateString(date));
    setIsOpen(false);
  };

  const changeMonth = (amount: number) => {
    setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };
  const changeYear = (amount: number) => {
    setVisibleMonth(current => new Date(current.getFullYear() + amount, current.getMonth(), 1));
  };
  const monthName = new Intl.DateTimeFormat('uz-UZ', { month: 'long' }).format(visibleMonth);

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {label && (
        <label
          htmlFor={pickerId}
          className="block pl-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <button
        id={pickerId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-required={required}
        disabled={disabled}
        onClick={() => setIsOpen(open => !open)}
        className={`neu-input flex w-full items-center justify-between gap-3 text-left text-sm ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${className}`}
      >
        <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
          {value ? formatDate(parsedValue!) : 'Sana tanlang'}
          {required && !value && <span className="sr-only">, majburiy</span>}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Sana tanlash"
          className="neu-raised absolute left-0 top-full z-50 mt-2 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border-subtle)] p-4 shadow-[var(--shadow-raised-lg)]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Oldingi oy"
              className="neu-button !rounded-xl !p-2 text-[var(--text-secondary)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-bold capitalize text-[var(--text-primary)]">{monthName}</h3>
              <button
                type="button"
                onClick={() => changeYear(-1)}
                aria-label="Oldingi yil"
                className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold text-[var(--text-primary)]">{visibleMonth.getFullYear()}</span>
              <button
                type="button"
                onClick={() => changeYear(1)}
                aria-label="Keyingi yil"
                className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Keyingi oy"
              className="neu-button !rounded-xl !p-2 text-[var(--text-secondary)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => (
              <span
                key={day}
                className="py-1 text-center text-[11px] font-bold text-[var(--text-muted)]"
              >
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dateKey = getLocalDateString(date);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = dateKey === value;
              const isToday = dateKey === today;

              return (
                <button
                  key={`${dateKey}-${index}`}
                  type="button"
                  aria-label={date.toLocaleDateString('uz-UZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  aria-pressed={isSelected}
                  onClick={() => chooseDate(date)}
                  className={`aspect-square rounded-xl text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-raised-sm)]'
                      : isToday
                        ? 'border border-[var(--accent)] text-[var(--accent)]'
                        : 'text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10'
                  } ${isCurrentMonth ? '' : 'opacity-40'}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10"
            >
              Tozalash
            </button>
            <button
              type="button"
              onClick={() => chooseDate(parseDate(today))}
              className="rounded-lg px-2 py-1 text-xs font-bold text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/10"
            >
              Bugun
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
