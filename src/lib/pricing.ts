/**
 * Site-wide fee promotion. Program records keep their list fee (`tuitionPkr`); the
 * promotion is applied when a fee is shown, so an offer can be switched on and off
 * from admin settings without editing every program. Client-safe: no server imports.
 */

export type Promotion = { active: boolean; percentOff: number; label: string };

export type Pricing = {
  /** The fee a learner pays now, or null when the program is fully funded. */
  tuitionPkr: number | null;
  /** The fee before the promotion; equals `tuitionPkr` when no promotion applies. */
  listPkr: number | null;
  /** Percentage taken off, 0 when no promotion applies. */
  percentOff: number;
  /** The promotion's label when it applies to this fee, otherwise null. */
  label: string | null;
};

/** Applies when the `academy.promotion` site setting has never been saved. */
export const DEFAULT_PROMOTION: Promotion = { active: true, percentOff: 50, label: "50% off all programs" };

/** Turns a stored setting of unknown shape into a usable promotion, falling back to the default. */
export function normalisePromotion(raw: unknown): Promotion {
  if (!raw || typeof raw !== "object") return DEFAULT_PROMOTION;
  const r = raw as Partial<Record<keyof Promotion, unknown>>;
  const percentOff = typeof r.percentOff === "number" && Number.isFinite(r.percentOff) ? Math.min(90, Math.max(0, Math.round(r.percentOff))) : DEFAULT_PROMOTION.percentOff;
  const label = typeof r.label === "string" && r.label.trim() ? r.label.trim() : `${percentOff}% off all programs`;
  return { active: r.active === true, percentOff, label };
}

/** The fee to show for a program, given its list fee and the current promotion. */
export function applyPromotion(listPkr: number | null, promotion: Promotion): Pricing {
  if (listPkr == null) return { tuitionPkr: null, listPkr: null, percentOff: 0, label: null };
  if (!promotion.active || promotion.percentOff <= 0) return { tuitionPkr: listPkr, listPkr, percentOff: 0, label: null };
  const tuitionPkr = Math.round(listPkr * (1 - promotion.percentOff / 100));
  return { tuitionPkr, listPkr, percentOff: promotion.percentOff, label: promotion.label };
}
