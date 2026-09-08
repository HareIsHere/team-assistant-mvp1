import { prisma } from "../src/lib/prisma.js";

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Database connection OK");
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
