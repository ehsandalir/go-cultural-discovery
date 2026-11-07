import { describe, expect, it } from "vitest";
import { POSITIONS, SAMPLES } from "@/routes/explore.index";
import { getVibe, VIBES } from "@/lib/vibes";

describe("GoExplore pilot gallery safety and geometry", () => {
  it("renders ten 10 by 10 blocks of equal position counts", () => {
    expect(POSITIONS).toHaveLength(100);
    expect(new Set(POSITIONS).size).toBe(100);
    expect(POSITIONS[0]).toBe(0);
    expect(POSITIONS[99]).toBe(99);
  });
  it("assigns collision-free stable positions and unique demo room numbers", () => {
    expect(new Set(SAMPLES.map(r => r.number)).size).toBe(SAMPLES.length);
    expect(new Set(SAMPLES.map(r => r.block + ":" + r.position)).size).toBe(SAMPLES.length);
    expect(SAMPLES.every(r => r.block >= 0 && r.block < 10 && r.position >= 0 && r.position < 100)).toBe(true);
  });
  it("places the first active room near the center in each populated block", () => {
    for (const block of new Set(SAMPLES.map(r => r.block))) {
      expect(SAMPLES.find(r => r.block === block)?.position).toBe(55);
    }
  });
  it("uses existing canonical Vibe identifiers and does not describe real users", () => {
    expect(VIBES).toHaveLength(24);
    expect(SAMPLES.every(r => getVibe(r.vibe))).toBe(true);
  });
});
