import type { VariantConfig, VariantKey } from '@/types';

// Sélectionner une variante selon le poids et la clé forcée
export function selectVariant(variants: VariantConfig[], requestedVariant?: string): VariantConfig {
  // Si une variante est forcée via query param ?v=a
  if (requestedVariant) {
    const found = variants.find((v) => v.key === requestedVariant);
    if (found) {
      return found;
    }
  }

  // Sinon, sélection pondérée aléatoire
  const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 0), 0);
  
  if (totalWeight === 0) {
    // Si aucun poids, retourner la première variante
    return variants[0];
  }

  const random = Math.random() * totalWeight;
  let cumulative = 0;

  for (const variant of variants) {
    cumulative += variant.weight || 0;
    if (random <= cumulative) {
      return variant;
    }
  }

  // Fallback : première variante
  return variants[0];
}

// Stocker la variante sélectionnée (côté client)
export function storeVariant(funnelSlug: string, variant: VariantKey): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`funnel_variant_${funnelSlug}`, variant);
  }
}

// Récupérer la variante stockée (côté client)
export function getStoredVariant(funnelSlug: string): VariantKey | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`funnel_variant_${funnelSlug}`) as VariantKey | null;
  }
  return null;
}

