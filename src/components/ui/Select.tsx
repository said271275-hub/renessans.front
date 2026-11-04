import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
  children?: React.ReactNode;
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
  'aria-label'?: string;
}

const collectOptions = (children: React.ReactNode): SelectOption[] => {
  const result: SelectOption[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      result.push(...collectOptions(child.props.children));
      return;
    }

    if (child.type === 'option') {
      const option = child as React.ReactElement<{
        value?: string | number;
        children?: React.ReactNode;
        disabled?: boolean;
      }>;
      const label = option.props.children;
      const value = option.props.value ?? (typeof label === 'string' ? label : '');
      result.push({
        value: String(value),
        label,
        disabled: option.props.disabled,
      });
    }
  });

  return result;
};

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  children,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className = '',
  id,
  placeholder = 'Tanlang',
  'aria-label': ariaLabel,
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const optionsList = useMemo<SelectOption[]>(
    () => options
      ? options.map(option => ({ value: String(option.value), label: option.label }))
      : collectOptions(children),
    [options, children],
  );
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const selectedValue = String(value ?? uncontrolledValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedOption = optionsList.find(option => option.value === selectedValue);
  const enabledIndexes = optionsList.reduce<number[]>((indexes, option, index) => {
    if (!option.disabled) indexes.push(index);
    return indexes;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const selectedIndex = optionsList.findIndex(option => option.value === selectedValue && !option.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? 0));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

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

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const chooseOption = (option: SelectOption) => {
    if (option.disabled) return;
    if (value === undefined) setUncontrolledValue(option.value);
    onValueChange?.(option.value);
    closeMenu();
  };

  const moveActiveOption = (direction: number) => {
    if (enabledIndexes.length === 0) return;
    const currentPosition = enabledIndexes.indexOf(activeIndex);
    const nextPosition = (currentPosition + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPosition]);
  };

  const openMenu = (direction = 1) => {
    if (disabled || optionsList.length === 0) return;
    const selectedIndex = optionsList.findIndex(option => option.value === selectedValue && !option.disabled);
    const startIndex = selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? 0);
    setActiveIndex(
      direction < 0 && selectedIndex < 0
        ? (enabledIndexes[enabledIndexes.length - 1] ?? 0)
        : startIndex,
    );
    setIsOpen(true);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(event.key === 'ArrowUp' ? -1 : 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) closeMenu();
      else openMenu();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeMenu();
    }
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(
        event.key === 'Home'
          ? (enabledIndexes[0] ?? 0)
          : (enabledIndexes[enabledIndexes.length - 1] ?? 0),
      );
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = optionsList[activeIndex];
      if (option) chooseOption(option);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    } else if (event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block pl-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={selectId ? `${selectId}-listbox` : undefined}
        aria-invalid={!!error}
        disabled={disabled}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={`neu-input flex w-full items-center justify-between gap-3 text-left text-sm ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${error ? 'border-red-400' : ''} ${className}`}
      >
        <span className={`truncate ${selectedOption ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          id={selectId ? `${selectId}-listbox` : undefined}
          role="listbox"
          className="neu-raised absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-[var(--border-subtle)] p-1.5 shadow-[var(--shadow-raised-lg)]"
        >
          {optionsList.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              ref={element => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              disabled={option.disabled}
              tabIndex={activeIndex === index ? 0 : -1}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={handleOptionKeyDown}
              onClick={() => chooseOption(option)}
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                option.value === selectedValue
                  ? 'bg-[var(--accent)]/15 font-semibold text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10'
              } ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span className="min-w-0 flex-1">{option.label}</span>
              {option.value === selectedValue && <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />}
            </button>
          ))}
          {optionsList.length === 0 && (
            <p className="px-3 py-2 text-sm text-[var(--text-muted)]">Tanlovlar mavjud emas</p>
          )}
        </div>
      )}
      {error && <p className="pl-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
