import { describe, expect, it } from "vitest";
import { DEFAULT_PROMOTION, applyPromotion, normalisePromotion } from "@/lib/pricing";

describe("applyPromotion", () => {
  it("halves a list fee under the default 50% promotion", () => {
    expect(applyPromotion(495_000, DEFAULT_PROMOTION)).toEqual({ tuitionPkr: 247_500, listPkr: 495_000, percentOff: 50, label: "50% off all programs" });
  });

  it("leaves fully funded programs alone", () => {
    expect(applyPromotion(null, DEFAULT_PROMOTION)).toEqual({ tuitionPkr: null, listPkr: null, percentOff: 0, label: null });
  });

  it("charges the list fee when the promotion is off or zero", () => {
    expect(applyPromotion(85_000, { active: false, percentOff: 50, label: "x" }).tuitionPkr).toBe(85_000);
    expect(applyPromotion(85_000, { active: true, percentOff: 0, label: "x" })).toMatchObject({ tuitionPkr: 85_000, percentOff: 0, label: null });
  });

  it("rounds to whole rupees", () => {
    expect(applyPromotion(35_001, { active: true, percentOff: 33, label: "x" }).tuitionPkr).toBe(23_451);
  });
});

describe("normalisePromotion", () => {
  it("falls back to the default when nothing is stored", () => {
    expect(normalisePromotion(undefined)).toEqual(DEFAULT_PROMOTION);
    expect(normalisePromotion("junk")).toEqual(DEFAULT_PROMOTION);
  });

  it("keeps a stored promotion and clamps the percentage", () => {
    expect(normalisePromotion({ active: true, percentOff: 120, label: "Big sale" })).toEqual({ active: true, percentOff: 90, label: "Big sale" });
    expect(normalisePromotion({ active: false, percentOff: 25, label: "" })).toEqual({ active: false, percentOff: 25, label: "25% off all programs" });
  });

  it("treats anything but an explicit true as inactive", () => {
    expect(normalisePromotion({ active: "yes", percentOff: 50, label: "x" }).active).toBe(false);
  });
});
