import { describe, it, expect } from "vitest";

describe("BOM Scrap Factor & Material Availability", () => {
  it("accurately calculates raw material required including scrap allowance", () => {
    // Domain rule: requiredQty = (qtyPerUnit * multiplier) / (1 - scrapFactor)
    const orderQty = 1000; // meters
    const outputQty = 1;
    const qtyPerUnit = 0.085; // kg of EPDM compound per meter
    const scrapFactor = 0.025; // 2.5% extrusion startup & scrap

    const multiplier = orderQty / outputQty;
    const grossRawMaterialNeeded = (qtyPerUnit * multiplier) / (1 - scrapFactor);

    // Expected: (0.085 * 1000) / (0.975) = 85 / 0.975 = ~87.179 kg
    expect(grossRawMaterialNeeded).toBeCloseTo(87.179, 2);
  });

  it("evaluates stock status as AVAILABLE or SHORT based on ledger balances", () => {
    const checkStatus = (available: number, required: number) => {
      return available >= required ? "AVAILABLE" : "SHORT";
    };

    expect(checkStatus(100, 87.18)).toBe("AVAILABLE");
    expect(checkStatus(50, 87.18)).toBe("SHORT");
    expect(checkStatus(87.18, 87.18)).toBe("AVAILABLE");
  });

  it("generates SO number sequence correctly", () => {
    const formatSONumber = (count: number, year = 2026) => {
      return `SO-${year}-${String(count).padStart(5, "0")}`;
    };

    expect(formatSONumber(1)).toBe("SO-2026-00001");
    expect(formatSONumber(150)).toBe("SO-2026-00150");
  });

  it("enforces Strict Hard Gate: blocks confirmation when any material is deficient", () => {
    const materials = [
      { code: "RM-PVC-K67", required: 53.33, available: 15000, status: "AVAILABLE" },
      { code: "RM-DOP-PLAST", required: 18.46, available: 10, status: "DEFICIT" }, // Deficit!
      { code: "RM-CAZN-01", required: 5.13, available: 200, status: "AVAILABLE" }
    ];

    const canConfirm = (mats: typeof materials) => {
      const hasDeficit = mats.some(m => m.status === "DEFICIT" || m.available < m.required);
      if (hasDeficit) {
        throw new Error("Strict Hard Gate: Cannot confirm order. Deficits detected.");
      }
      return true;
    };

    expect(() => canConfirm(materials)).toThrow("Strict Hard Gate: Cannot confirm order. Deficits detected.");

    // All available passes
    const validMaterials = materials.map(m => ({ ...m, available: 500, status: "AVAILABLE" }));
    expect(canConfirm(validMaterials)).toBe(true);
  });

  it("calculates Available Stock as Physical minus Reserved without negative stock", () => {
    const calculateAvailable = (physical: number, reserved: number) => {
      return Math.max(0, physical - reserved);
    };

    expect(calculateAvailable(1000, 300)).toBe(700);
    expect(calculateAvailable(500, 500)).toBe(0);
    // Over-reserved in legacy data should clamp to 0, preventing negative stock
    expect(calculateAvailable(200, 300)).toBe(0);
  });

  it("calculates 1-click PO deficit replenishment quantities", () => {
    const required = 87.18;
    const available = 50.0;
    const deficit = Math.ceil(required - available);
    expect(deficit).toBe(38);
  });
});

