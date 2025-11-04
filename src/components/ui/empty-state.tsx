'use client';

import { ReactNode } from 'react';
import { Button } from './button';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && <div className="mb-6">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

// Illustrations SVG modernes
export function EmptyFunnelsIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/20"
    >
      <circle cx="100" cy="60" r="40" fill="currentColor" />
      <path
        d="M80 100 L100 130 L120 100"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M90 130 L100 150 L110 130"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="170" r="15" fill="currentColor" />
    </svg>
  );
}

export function EmptyLeadsIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/20"
    >
      <circle cx="100" cy="70" r="30" fill="currentColor" />
      <path
        d="M70 110 Q70 100 80 100 L120 100 Q130 100 130 110 L130 150 Q130 160 120 160 L80 160 Q70 160 70 150 Z"
        fill="currentColor"
      />
      <rect x="85" y="120" width="30" height="4" rx="2" fill="white" />
      <rect x="85" y="130" width="20" height="4" rx="2" fill="white" />
    </svg>
  );
}

export function EmptySearchIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/20"
    >
      <circle
        cx="90"
        cy="90"
        r="40"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
      />
      <path
        d="M120 120 L150 150"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M140 140 L160 160"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

