import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Générer un slug à partir d'un texte
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Formater une date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

// Formater une date avec heure
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Formater un nombre
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

// Formater un pourcentage
export function formatPercent(num: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num / 100);
}

// Styles pour les badges de status
export const statusStyles = {
  // Funnel status
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800',
  
  // Lead status
  pending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
} as const;

// Extraire les UTM params d'une URL
export function extractUTMParams(searchParams: URLSearchParams): Record<string, string> {
  const utmParams: Record<string, string> = {};
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  utmKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });
  
  return utmParams;
}
