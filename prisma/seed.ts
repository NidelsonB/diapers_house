import { ensureDatabaseSeed } from "../src/lib/site-repository";
import { prisma } from "../src/lib/prisma";

async function main() {
  await ensureDatabaseSeed();
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
