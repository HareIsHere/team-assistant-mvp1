import { prisma } from "../../lib/prisma.js";

export async function findOrCreateUser(whatsappId: string, name?: string) {
  return prisma.user.upsert({
    where: { whatsappId },
    update: name ? { name } : {},
    create: { whatsappId, name }
  });
}
