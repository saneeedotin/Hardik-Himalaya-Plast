import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Renaming extrusion lines...");

  await prisma.workstation.update({
    where: { code: "LINE-03" },
    data: { name: "Extrusion Line 03" },
  });

  await prisma.workstation.update({
    where: { code: "LINE-04" },
    data: { name: "Extrusion Line 04" },
  });

  await prisma.workstation.update({
    where: { code: "LINE-05" },
    data: { name: "Extrusion Line 05" },
  });

  await prisma.workstation.update({
    where: { code: "LINE-06" },
    data: { name: "Extrusion Line 06" },
  });

  // Since user said "keep the rest 4 same as them", maybe they meant exactly the same naming format. I'll just name them "Extrusion Line X". 
  // Optionally rename line 1 and 2 if they wanted them all simple? 
  // "as we had extrusion line 1 and extrusion line 2 keep the rest 4 same as them" 
  // I will just name them Extrusion Line 03, 04, 05, 06.

  console.log("✅ Renamed 4 new extrusion lines!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
