import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function main() {
  const all = await prisma.dSF.findMany({
    where: { note13: { not: Prisma.JsonNull } },
    select: { id: true, folderId: true, note13: true },
  });

  let cleaned = 0;
  for (const row of all) {
    const note13 = row.note13 as any;
    const shareholders = note13?.shareholders;
    if (!Array.isArray(shareholders)) continue;

    const hasDemo = shareholders.some(
      (s: any) =>
        typeof s?.name === "string" &&
        (s.name.includes("PIGLA") || s.name.includes("NDJONGAG"))
    );
    if (!hasDemo) continue;

    const cleanedShareholders = shareholders.map((s: any) => {
      if (
        typeof s?.name === "string" &&
        (s.name.includes("PIGLA") || s.name.includes("NDJONGAG"))
      ) {
        return {
          ...s,
          name: "",
          nationality: "",
          shareType: "",
          number: 0,
          totalAmount: 0,
          repayments: 0,
        };
      }
      return s;
    });

    await prisma.dSF.update({
      where: { id: row.id },
      data: { note13: { ...note13, shareholders: cleanedShareholders } },
    });
    cleaned++;
    console.log(`Nettoyé: dossier ${row.folderId}`);
  }

  console.log(`Terminé. ${cleaned} dossier(s) nettoyé(s) sur ${all.length} avec note13.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
