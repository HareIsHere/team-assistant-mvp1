import { prisma } from "../../lib/prisma.js";

export async function findOrCreateUser(telegramId: string, name?: string) {
  return prisma.user.upsert({
    where: { telegramId },
    update: name ? { name } : {},
    create: { telegramId, name }
  });
}