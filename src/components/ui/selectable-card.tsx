'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectableCardProps {
  value: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

export function SelectableCard({
  value,
  label,
  description,
  selected,
  onSelect,
  className,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full text-left rounded-lg border-2 p-4 transition-all duration-200',
        'hover:border-primary/50 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
          selected
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/30'
        )}>
          {selected && (
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
        
        <div className="flex-1">
          <div className={cn(
            'font-medium transition-colors',
            selected ? 'text-primary' : 'text-foreground'
          )}>
            {label}
          </div>
          {description && (
            <div className="mt-1 text-sm text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Checkmark animé en haut à droite */}
      {selected && (
        <div className="absolute right-3 top-3">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center animate-slide-up">
            <svg
              className="h-4 w-4 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

interface SelectableCardGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function SelectableCardGroup({
  value,
  onValueChange,
  children,
  className,
}: SelectableCardGroupProps) {
  return (
    <div className={cn('space-y-3', className)} role="radiogroup">
      {children}
    </div>
  );
}

