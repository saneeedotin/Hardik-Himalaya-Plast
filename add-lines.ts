import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding 4 new extrusion lines...");

  await prisma.workstation.create({
    data: {
      code: "LINE-03",
      name: "Extrusion Line 03 (High-Speed Profile Line)",
      hourlyRate: 700.0,
      status: "IDLE",
    },
  });

  await prisma.workstation.create({
    data: {
      code: "LINE-04",
      name: "Extrusion Line 04 (Heavy Duty Pipe Line)",
      hourlyRate: 900.0,
      status: "IDLE",
    },
  });

  await prisma.workstation.create({
    data: {
      code: "LINE-05",
      name: "Extrusion Line 05 (TPE Weatherseal Line)",
      hourlyRate: 800.0,
      status: "IDLE",
    },
  });

  await prisma.workstation.create({
    data: {
      code: "LINE-06",
      name: "Extrusion Line 06 (Custom Gasket Line)",
      hourlyRate: 600.0,
      status: "IDLE",
    },
  });

  console.log("✅ Added 4 new extrusion lines!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
