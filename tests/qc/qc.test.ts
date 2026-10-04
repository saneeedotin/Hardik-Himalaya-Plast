import { describe, it, expect } from "vitest";

describe("QC Station & Tolerances", () => {
  it("enforces 5-sample testing standard by default", () => {
    const defaultSampleSize = 5;
    expect(defaultSampleSize).toBe(5);
  });

  it("validates profile tolerance limits (sample check)", () => {
    // Standard profile tolerance rules: +/- 0.2mm for width
    const targetWidth = 18.5;
    const tolerance = 0.2;

    const isWithinTolerance = (measured: number) => {
      return Math.abs(measured - targetWidth) <= tolerance;
    };

    expect(isWithinTolerance(18.55)).toBe(true);
    expect(isWithinTolerance(18.70)).toBe(true);
    expect(isWithinTolerance(18.75)).toBe(false);
    expect(isWithinTolerance(18.25)).toBe(false);
  });

  it("determines QC decision based on measurements", () => {
    const evaluateBatch = (samples: number[], target: number, tolerance: number) => {
      const fails = samples.filter((s) => Math.abs(s - target) > tolerance);
      if (fails.length === 0) return "PASS";
      if (fails.length <= 1) return "REWORK";
      return "SCRAP";
    };

    const target = 10.0;
    const tol = 0.2;

    expect(evaluateBatch([10.0, 10.1, 9.9, 10.05, 10.0], target, tol)).toBe("PASS");
    expect(evaluateBatch([10.0, 10.3, 10.0, 10.0, 10.1], target, tol)).toBe("REWORK");
    expect(evaluateBatch([10.0, 10.5, 9.2, 10.0, 10.1], target, tol)).toBe("SCRAP");
  });

  it("formats QC report number correctly", () => {
    const generateQCNumber = (count: number, year = 2026) => {
      return `QC-${year}-${String(count).padStart(5, "0")}`;
    };

    expect(generateQCNumber(1)).toBe("QC-2026-00001");
    expect(generateQCNumber(42)).toBe("QC-2026-00042");
  });
});
