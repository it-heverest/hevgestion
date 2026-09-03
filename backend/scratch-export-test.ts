import { dsfFillerService } from "./src/services/dsf-filler.service";
import { prisma } from "./src/lib/prisma";

async function main() {
  const folderId = "810fb9c5-aba0-4b23-8cea-c42921591fb9";
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: { client: true },
  });
  if (!folder) {
    console.log("folder not found");
    return;
  }
  try {
    const result = await dsfFillerService.fillTemplate(folderId, folder.client.name, [
      folder.ownerId,
    ]);
    console.log("OK -- buffer size:", result.buffer.length, "source:", result.templateSource);
  } catch (e: any) {
    console.error("FAIL:", e.message);
  }
}

main()
  .catch((e) => console.error("UNCAUGHT:", e))
  .finally(() => prisma.$disconnect());
