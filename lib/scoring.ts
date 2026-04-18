export type { CategoryWeights } from "@workspace/api-client-react/src/generated/api.schemas";

/**
 * Simple helper to clamp a value between 0‑100.
 */
function clamp01(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/**
 * Compute a consistent “Strength Index” (0‑100) for each country.
 * The same formula is used by the map visualisation and the head‑to‑head
 * score breakdown, so the numbers will line‑up.
 *
 * The function also returns a colour‑ready value (0‑1) that can be mapped
 * to a colour gradient.
 */
export function computeStrengthIndex(
  country: Country,
  maxVals: {
    personnel: number;
    aircraft: number;
    naval: number;
    budget: number;
  }
): { score: number; normScore: number } {
  // Normalise each raw metric to a 0‑100 scale using the global max.
  const norm = (value: number, max: number) =>
    max ? (value / max) * 100 : 0;

  const personnelScore = clamp01(
    norm(
      (country.metrics.activePersonnel ?? 0) + (country.metrics.reservePersonnel ?? 0),
      maxVals.personnel
    )
  );

  const airScore = clamp01(
    norm(country.metrics.aircraft ?? 0, maxVals.aircraft)
  );

  const navalScore = clamp01(
    norm(
      (country.metrics.navalVessels ?? 0) +
        (country.metrics.submarines ?? 0) * 2 +
        (country.metrics.aircraftCarriers ?? 0) * 10,
      maxVals.naval
    )
  );

  const budgetScore = clamp01(
    norm(country.metrics.defenseBudgetUsd ?? 0, maxVals.budget)
  );

  // Weighted sum – you can tweak the weights in the UI later.
  const score = (
    personnelScore * DEFAULT_WEIGHTS.manpower +
    airScore * DEFAULT_WEIGHTS.airPower +
    navalScore * DEFAULT_WEIGHTS.navalForces +
    budgetScore * DEFAULT_WEIGHTS.economy
  );

  return { score: Math.round(score), normScore: score / 100 };
}

/**
 * Helper to turn a 0‑100 score into a colour string.
 * Low scores → muted gray, mid scores → amber, high scores → gold.
 */
export function scoreToColor(score: number): string {
  // 0‑30 → gray, 31‑70 → amber, 71‑100 → gold
  if (score <= 30) return "hsl(var(--muted))";
  if (score <= 70) return "hsl(var(--primary))";
  return "hsl(var(--primary))";
}

/* Default balanced weights – you can expose these via UI later if needed. */
export const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.2,
  airPower: 0.2,
  groundForces: 0.2,
  navalForces: 0.2,
  economy: 0.1,
  logistics: 0.1,
};