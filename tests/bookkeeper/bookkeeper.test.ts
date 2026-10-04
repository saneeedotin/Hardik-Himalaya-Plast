import { describe, it, expect } from "vitest";

describe("Book Keeper Accounting Integration", () => {
  it("structures valid Book Keeper Sales Invoice CSV format with GST", () => {
    const buildSalesCsv = (
      invoiceNumber: string,
      partyName: string,
      itemCode: string,
      qty: number,
      rate: number
    ) => {
      const taxable = qty * rate;
      const gstRate = 18;
      const taxAmount = (taxable * gstRate) / 100;
      const total = taxable + taxAmount;
      const header =
        "Voucher Type,Voucher No,Date,Party Name,GSTIN,Item Code,Item Name,HSN Code,Quantity,Unit,Price,Taxable Amount,GST Rate %,Tax Amount,Total Amount,Narration";
      const row = `Sales,${invoiceNumber},04/10/2026,"${partyName}",24AAACA1234F1Z5,${itemCode},"uPVC Glazing Gasket Profile 101",39169090,${qty},Meter,${rate.toFixed(
        2
      )},${taxable.toFixed(2)},${gstRate},${taxAmount.toFixed(2)},${total.toFixed(2)},"Extrusion Dispatch"`;
      return `${header}\n${row}`;
    };

    const csv = buildSalesCsv("HP-INV-2026-00001", "Apex Windows & Façade Ltd", "HP-GASKET-A101", 5000, 34.5);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Voucher Type,Voucher No,Date,Party Name,GSTIN");
    expect(lines[1]).toContain("Sales,HP-INV-2026-00001");
    expect(lines[1]).toContain("Apex Windows & Façade Ltd");
    expect(lines[1]).toContain("172500.00"); // 5000 * 34.5
    expect(lines[1]).toContain("31050.00"); // 18% GST
    expect(lines[1]).toContain("203550.00"); // Total with tax
  });

  it("structures valid Book Keeper Material Issue Consumption format", () => {
    const buildConsumptionCsv = (
      soNumber: string,
      woNumber: string,
      materials: Array<{ code: string; name: string; qty: number; rate: number }>
    ) => {
      const header =
        "Voucher Type,Voucher No,Date,Sales Order,Work Order,Item Code,Item Name,Category,Quantity,Unit,Standard Cost,Amount,Narration";
      const rows = materials.map((m, idx) => {
        const amount = (m.qty * m.rate).toFixed(2);
        return `Material Issue,HP-MAT-${idx + 1},04/10/2026,${soNumber},${woNumber},${m.code},"${m.name}",RAW_MATERIAL,${m.qty.toFixed(
          2
        )},Kg,${m.rate.toFixed(2)},${amount},"Consumed for ${soNumber}"`;
      });
      return [header, ...rows].join("\n");
    };

    const csv = buildConsumptionCsv("SAL-ORD-2026-00001", "PROD-WO-2026-00001", [
      { code: "RM-PVC-K67", name: "PVC Resin K-67", qty: 266.67, rate: 94.5 },
      { code: "RM-DOP-PLAST", name: "DOP Plasticizer", qty: 92.31, rate: 145 },
    ]);

    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("Material Issue,HP-MAT-1");
    expect(lines[1]).toContain("RM-PVC-K67");
    expect(lines[2]).toContain("RM-DOP-PLAST");
  });
});
