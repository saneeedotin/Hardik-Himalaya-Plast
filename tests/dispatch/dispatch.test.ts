import { describe, it, expect } from "vitest";

describe("Dispatch & QR Gate Scanning", () => {
  const cartons = [
    { id: "c1", cartonCode: "HP-BOX-001", scanned: false },
    { id: "c2", cartonCode: "HP-BOX-002", scanned: false },
    { id: "c3", cartonCode: "HP-BOX-003", scanned: false },
  ];

  it("detects and rejects duplicate scans when override is false", () => {
    const scannedCarton = { id: "c1", cartonCode: "HP-BOX-001", scanned: true };

    const attemptScan = (carton: typeof scannedCarton, override = false) => {
      if (carton.scanned && !override) {
        return { success: false, status: 409, error: "Already scanned" };
      }
      return { success: true, status: 200 };
    };

    expect(attemptScan(scannedCarton, false).success).toBe(false);
    expect(attemptScan(scannedCarton, false).status).toBe(409);
    expect(attemptScan(scannedCarton, true).success).toBe(true);
  });

  it("requires override notes when performing supervisor override", () => {
    const validateOverride = (override: boolean, note: string) => {
      if (override && (!note || note.trim().length < 3)) {
        return { valid: false, error: "Override reason is mandatory" };
      }
      return { valid: true };
    };

    expect(validateOverride(true, "").valid).toBe(false);
    expect(validateOverride(true, "ok").valid).toBe(false);
    expect(validateOverride(true, "Damaged barcode label verified manually").valid).toBe(true);
  });

  it("marks delivery note dispatched only when 100% of cartons are verified", () => {
    const checkDispatchReadiness = (allCartons: Array<{ scanned: boolean }>) => {
      const scannedCount = allCartons.filter((c) => c.scanned).length;
      const totalCount = allCartons.length;
      return {
        scannedCount,
        totalCount,
        isComplete: totalCount > 0 && scannedCount === totalCount,
      };
    };

    expect(
      checkDispatchReadiness([
        { scanned: true },
        { scanned: false },
        { scanned: false },
      ]).isComplete
    ).toBe(false);

    expect(
      checkDispatchReadiness([
        { scanned: true },
        { scanned: true },
        { scanned: true },
      ]).isComplete
    ).toBe(true);
  });
});
