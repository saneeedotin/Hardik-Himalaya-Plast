import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Himalaya Plast Factory OS Database Seeding...");

  // Clean existing tables in reverse dependency order
  await prisma.tallySyncLog.deleteMany();
  await prisma.cartonLabel.deleteMany();
  await prisma.deliveryNote.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.jobCard.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.bOMItem.deleteMany();
  await prisma.bOM.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.workstation.deleteMany();
  await prisma.item.deleteMany();
  
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing database records.");

  // 1. Roles & Permissions
  const roleNames = ["Founder", "Sales", "Purchase", "Stores", "Production", "QC", "Accounts", "Dispatch"];
  const roles: Record<string, any> = {};
  for (const name of roleNames) {
    roles[name] = await prisma.role.create({ data: { name } });
  }

  const pAll = await prisma.permission.create({ data: { resource: "*", action: "*" } });
  await prisma.rolePermission.create({ data: { roleId: roles["Founder"].id, permissionId: pAll.id } });

  // Dynamically hash password for "Password123!"
  const passwordHash = await argon2.hash("Password123!");

  // 1.5. Users
  const founder = await prisma.user.create({
    data: {
      email: "param@himalayaplast.com",
      name: "Param (Founder & MD)",
      passwordHash,
      isActive: true,
      employeeCode: "HP-001",
      roles: { create: [{ roleId: roles["Founder"].id }] }
    },
  });

  const plantHead = await prisma.user.create({
    data: {
      email: "ramesh@himalayaplast.com",
      name: "Ramesh Kumar (Plant Head)",
      passwordHash,
      isActive: true,
      employeeCode: "HP-002",
      roles: { create: [{ roleId: roles["Production"].id }] }
    },
  });

  const operator1 = await prisma.user.create({
    data: {
      email: "operator1@himalayaplast.com",
      name: "Suresh Sharma (Extrusion Lead)",
      passwordHash,
      isActive: true,
      employeeCode: "HP-014",
      roles: { create: [{ roleId: roles["Production"].id }] }
    },
  });

  const warehouseScanner = await prisma.user.create({
    data: {
      email: "scanner@himalayaplast.com",
      name: "Dinesh Yadav (Dispatch Officer)",
      passwordHash,
      isActive: true,
      employeeCode: "HP-022",
      roles: { create: [{ roleId: roles["Dispatch"].id }] }
    },
  });

  const salesExec = await prisma.user.create({
    data: {
      email: "sales@himalayaplast.com",
      name: "Pooja Mehta (Sales Executive)",
      passwordHash,
      isActive: true,
      employeeCode: "HP-008",
      roles: { create: [{ roleId: roles["Sales"].id }] }
    },
  });

  console.log("👤 Created 5 core system users.");

  // 2. Workstations / Extrusion Lines
  const line01 = await prisma.workstation.create({
    data: {
      code: "LINE-01",
      name: "Extrusion Line 01 (uPVC Main Line - 65mm Screw)",
      hourlyRate: 650.0,
      status: "RUNNING",
    },
  });

  const line02 = await prisma.workstation.create({
    data: {
      code: "LINE-02",
      name: "Extrusion Line 02 (TPE Co-extrusion Line - Dual Extruder)",
      hourlyRate: 850.0,
      status: "IDLE",
    },
  });

  console.log("🏭 Created 2 extrusion workstation lines.");

  // 3. Raw Materials & Finished Goods
  // Raw Materials
  const rmPVC = await prisma.item.create({
    data: {
      code: "RM-PVC-K67",
      name: "PVC Resin K-67 Suspension Grade (Reliance/Chemplast)",
      category: "RAW_MATERIAL",
      uom: "Kg",
      hsnCode: "39041020",
      standardCost: 94.5,
      minStockLevel: 5000,
    },
  });

  const rmDOP = await prisma.item.create({
    data: {
      code: "RM-DOP-PLAST",
      name: "DOP Plasticizer (Di-Octyl Phthalate)",
      category: "RAW_MATERIAL",
      uom: "Kg",
      hsnCode: "29173200",
      standardCost: 145.0,
      minStockLevel: 2000,
    },
  });

  const rmCaZn = await prisma.item.create({
    data: {
      code: "RM-CAZN-01",
      name: "Calcium Zinc One-Pack Heat Stabilizer (Lead-Free)",
      category: "RAW_MATERIAL",
      uom: "Kg",
      hsnCode: "38123900",
      standardCost: 210.0,
      minStockLevel: 1000,
    },
  });

  const rmCarbon = await prisma.item.create({
    data: {
      code: "RM-BLACK-MB",
      name: "Carbon Black Masterbatch 40% (UV Grade)",
      category: "RAW_MATERIAL",
      uom: "Kg",
      hsnCode: "32064900",
      standardCost: 180.0,
      minStockLevel: 500,
    },
  });

  // Finished Goods
  const fgGasketA101 = await prisma.item.create({
    data: {
      code: "HP-GASKET-A101",
      name: "uPVC Window Glazing Gasket Type A (Profile 101)",
      category: "FINISHED_GOODS",
      uom: "Meter",
      hsnCode: "39169090",
      standardCost: 34.5,
      minStockLevel: 2500,
      qcTemplate: JSON.stringify([
        { id: "pinSize", name: "Pin Size", type: "number", nominal: 4.00, tolerance: 0.05, uom: "mm" },
        { id: "width", name: "Width", type: "number", nominal: 12.00, tolerance: 0.10, uom: "mm" },
        { id: "legThickness", name: "Leg Thickness", type: "number", nominal: 1.50, tolerance: 0.05, uom: "mm" },
        { id: "linearWeight", name: "Linear Weight", type: "number", nominal: 75.0, tolerance: 1.0, uom: "g/m" },
        { id: "fitTest", name: "Sash Fit Test", type: "select", options: ["PASS - Snug Fit", "TIGHT - Swollen", "LOOSE - Slips"] }
      ]),
    },
  });

  const fgTpeB202 = await prisma.item.create({
    data: {
      code: "HP-TPE-B202",
      name: "TPE Dynamic Door Weatherseal Profile B (202)",
      category: "FINISHED_GOODS",
      uom: "Meter",
      hsnCode: "39169090",
      standardCost: 48.0,
      minStockLevel: 2000,
      qcTemplate: JSON.stringify([
        { id: "pinSize", name: "Pin Size", type: "number", nominal: 4.10, tolerance: 0.05, uom: "mm" },
        { id: "width", name: "Width", type: "number", nominal: 12.20, tolerance: 0.10, uom: "mm" },
        { id: "legThickness", name: "Leg Thickness", type: "number", nominal: 1.60, tolerance: 0.05, uom: "mm" },
        { id: "linearWeight", name: "Linear Weight", type: "number", nominal: 78.0, tolerance: 1.0, uom: "g/m" },
        { id: "fitTest", name: "Sash Fit Test", type: "select", options: ["PASS - Snug Fit", "TIGHT - Swollen", "LOOSE - Slips"] }
      ]),
    },
  });

  const fgBeadC303 = await prisma.item.create({
    data: {
      code: "HP-BEAD-C303",
      name: "Glazing Bead Co-extruded Soft Lip (Profile 303)",
      category: "FINISHED_GOODS",
      uom: "Meter",
      hsnCode: "39169090",
      standardCost: 26.5,
      minStockLevel: 3000,
      qcTemplate: JSON.stringify([
        { id: "outerDia", name: "Outer Diameter", type: "number", nominal: 8.00, tolerance: 0.15, uom: "mm" },
        { id: "innerDia", name: "Inner Diameter", type: "number", nominal: 6.00, tolerance: 0.10, uom: "mm" },
        { id: "flexibility", name: "Flexibility Test", type: "select", options: ["PASS - No Cracks", "FAIL - Cracked"] }
      ]),
    },
  });

  console.log("📦 Created 4 Raw Materials and 3 Finished Goods.");

  // 4. BOM with standard 2.5% scrap allowance
  const bomGasket = await prisma.bOM.create({
    data: {
      name: "BOM - HP-GASKET-A101 (100 Meters Standard Run)",
      fgItemId: fgGasketA101.id,
      outputQty: 100, // 100 meters
      scrapFactor: 0.025, // 2.5% purge & trim allowance
      materials: {
        create: [
          { rmItemId: rmPVC.id, qtyPerUnit: 0.052 }, // 5.2 kg per 100m
          { rmItemId: rmDOP.id, qtyPerUnit: 0.018 }, // 1.8 kg per 100m
          { rmItemId: rmCaZn.id, qtyPerUnit: 0.005 }, // 0.5 kg per 100m
          { rmItemId: rmCarbon.id, qtyPerUnit: 0.0038 }, // 0.38 kg per 100m
        ],
      },
    },
  });

  // 5. Batches
  const batchRM1 = await prisma.batch.create({
    data: {
      batchNumber: "BATCH-RM-2026-00101",
      itemId: rmPVC.id,
      quantity: 15000,
      uom: "Kg",
      source: "PURCHASE",
    },
  });

  const batchFG1 = await prisma.batch.create({
    data: {
      batchNumber: "BATCH-FG-2026-00101",
      itemId: fgGasketA101.id,
      quantity: 5000,
      uom: "Meter",
      source: "EXTRUSION",
      parentBatchId: batchRM1.id,
    },
  });

  const batchFG2 = await prisma.batch.create({
    data: {
      batchNumber: "BATCH-FG-2026-00102",
      itemId: fgTpeB202.id,
      quantity: 1800,
      uom: "Meter",
      source: "EXTRUSION",
    },
  });

  console.log("🧬 Created multi-item BOMs and traceable material batches.");

  // 6. Sales Orders (3 realistic client scenarios)
  // Scenario 1: Ready to Dispatch (5,000 meters)
  const so1 = await prisma.salesOrder.create({
    data: {
      orderNumber: "SAL-ORD-2026-00001",
      customerName: "Apex Windows & Façade Ltd",
      customerGstin: "24AAACA1234F1Z5",
      deliveryDate: new Date(Date.now() + 86400000), // tomorrow
      status: "READY_TO_DISPATCH",
      approvalMethod: "WHATSAPP",
      totalAmount: 172500.0,
      notes: "High priority commercial facade contract. Urgent site delivery.",
      items: {
        create: [
          {
            itemId: fgGasketA101.id,
            qty: 5000,
            rate: 34.5,
            amount: 172500.0,
          },
        ],
      },
    },
  });

  // Scenario 2: Currently in Extrusion Production
  const so2 = await prisma.salesOrder.create({
    data: {
      orderNumber: "SAL-ORD-2026-00002",
      customerName: "Duroplast Profiles India Pvt Ltd",
      customerGstin: "27AABCD5678G2Z1",
      deliveryDate: new Date(Date.now() + 4 * 86400000),
      status: "IN_PRODUCTION",
      approvalMethod: "EMAIL",
      totalAmount: 192000.0,
      notes: "Color match charcoal black. Require fit test sample before bulk packing.",
      items: {
        create: [
          {
            itemId: fgTpeB202.id,
            qty: 4000,
            rate: 48.0,
            amount: 192000.0,
          },
        ],
      },
    },
  });

  // Scenario 3: Approved & Queued for scheduling
  const so3 = await prisma.salesOrder.create({
    data: {
      orderNumber: "SAL-ORD-2026-00003",
      customerName: "Greenline Fenestration Systems",
      customerGstin: "07AABCG9012H3Z9",
      deliveryDate: new Date(Date.now() + 7 * 86400000),
      status: "APPROVED",
      approvalMethod: "WHATSAPP",
      totalAmount: 79500.0,
      notes: "Standard glazing bead with soft TPE lip. Dispatch via V-Trans.",
      items: {
        create: [
          {
            itemId: fgBeadC303.id,
            qty: 3000,
            rate: 26.5,
            amount: 79500.0,
          },
        ],
      },
    },
  });

  console.log("📋 Created 3 active Sales Orders across sales lifecycle.");

  // 7. Work Orders & Job Cards
  const wo1 = await prisma.workOrder.create({
    data: {
      workOrderNumber: "MFG-WO-2026-00001",
      salesOrderId: so1.id,
      fgItemId: fgGasketA101.id,
      plannedQty: 5000,
      producedQty: 5000,
      status: "COMPLETED",
      fgBatchNumber: batchFG1.batchNumber,
      startDate: new Date(Date.now() - 24 * 3600000),
      endDate: new Date(Date.now() - 4 * 3600000),
    },
  });

  const jc1 = await prisma.jobCard.create({
    data: {
      workOrderId: wo1.id,
      workstationId: line01.id,
      assignedUserId: operator1.id,
      status: "COMPLETED",
      goodQty: 5000,
      scrapQty: 125, // 2.5% scrap
      startedAt: new Date(Date.now() - 24 * 3600000),
      completedAt: new Date(Date.now() - 4 * 3600000),
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      workOrderNumber: "MFG-WO-2026-00002",
      salesOrderId: so2.id,
      fgItemId: fgTpeB202.id,
      plannedQty: 4000,
      producedQty: 1800,
      status: "IN_PROGRESS",
      fgBatchNumber: batchFG2.batchNumber,
      startDate: new Date(Date.now() - 5 * 3600000),
    },
  });

  const jc2 = await prisma.jobCard.create({
    data: {
      workOrderId: wo2.id,
      workstationId: line01.id,
      assignedUserId: operator1.id,
      status: "ACTIVE",
      goodQty: 1800,
      scrapQty: 45,
      startedAt: new Date(Date.now() - 5 * 3600000),
    },
  });

  // 8. Quality Inspection (4-State Workflow: PASS and REWORK)
  await prisma.qualityInspection.create({
    data: {
      reportNumber: "QC-2026-00001",
      jobCardId: jc1.id,
      batchNumber: batchFG1.batchNumber,
      status: "PASS",
      sampleSize: 5,
      qcData: JSON.stringify({
        pinSize: 4.02,
        width: 12.05,
        legThickness: 1.49,
        linearWeight: 74.8,
        fitTest: "PASS - Snug Fit"
      }),
      inspectorName: "Ramesh Kumar",
      inspectedAt: new Date(Date.now() - 3 * 3600000),
    },
  });

  await prisma.qualityInspection.create({
    data: {
      reportNumber: "QC-2026-00002",
      jobCardId: jc2.id,
      batchNumber: batchFG2.batchNumber,
      status: "REWORK",
      sampleSize: 5,
      qcData: JSON.stringify({
        pinSize: 4.15,
        width: 12.35,
        legThickness: 1.62,
        linearWeight: 79.2,
        fitTest: "TIGHT - Swollen"
      }),
      inspectorName: "Ramesh Kumar",
      inspectedAt: new Date(Date.now() - 1 * 3600000),
      reworkNotes: "Die temperature too high at 192°C causing profile swelling. Reduce zone 3 to 184°C.",
    },
  });

  console.log("🔬 Created Quality Inspections (PASS & REWORK).");

  // 9. Delivery Note and 5 Carton Labels for SO1 (3 scanned, 2 pending)
  const dn1 = await prisma.deliveryNote.create({
    data: {
      dnNumber: "DN-26-00001",
      salesOrderId: so1.id,
      customerName: "Apex Windows & Façade Ltd",
      transporterName: "V-Trans Logistics India",
      vehicleNumber: "GJ-01-EE-4921",
      lrNumber: "VT-992140",
      status: "DRAFT",
    },
  });

  const cartonsData = [
    { code: "HP-CTN-BATCH-FG-00101-001", scanned: true, scannedAt: new Date(Date.now() - 30 * 60000) },
    { code: "HP-CTN-BATCH-FG-00101-002", scanned: true, scannedAt: new Date(Date.now() - 25 * 60000) },
    { code: "HP-CTN-BATCH-FG-00101-003", scanned: true, scannedAt: new Date(Date.now() - 20 * 60000) },
    { code: "HP-CTN-BATCH-FG-00101-004", scanned: false, scannedAt: null },
    { code: "HP-CTN-BATCH-FG-00101-005", scanned: false, scannedAt: null },
  ];

  for (const c of cartonsData) {
    await prisma.cartonLabel.create({
      data: {
        cartonCode: c.code,
        deliveryNoteId: dn1.id,
        batchId: batchFG1.id,
        quantity: 1000, // 1000 meters per carton
        scanned: c.scanned,
        scannedById: c.scanned ? warehouseScanner.id : null,
        scannedAt: c.scannedAt,
      },
    });
  }

  console.log("🏷️ Created Delivery Note DN-26-00001 with 5 Carton Labels (3 scanned, 2 ready to scan).");

  // 10. Tally Audit Log
  await prisma.tallySyncLog.create({
    data: {
      documentType: "SALES_INVOICE",
      documentId: "DN-26-00001",
      exportedXml: `<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC><REQUESTDATA><TALLYMESSAGE xmlns:UDF="TallyUDF"><VOUCHER VCHTYPE="Sales" ACTION="Create"><DATE>20261001</DATE><VOUCHERNUMBER>HP-INV-2026-00001</VOUCHERNUMBER><PARTYLEDGERNAME>Apex Windows &amp; Façade Ltd</PARTYLEDGERNAME><ALLLEDGERENTRIES.LIST><LEDGERNAME>Sales - uPVC Gaskets</LEDGERNAME><ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>172500.00</AMOUNT></ALLLEDGERENTRIES.LIST></VOUCHER></TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`,
      status: "SUCCESS",
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
