import { prisma } from "../../lib/prisma.js";
export async function findOrCreateUser(whatsappId, name) {
    return prisma.user.upsert({
        where: { whatsappId },
        update: name ? { name } : {},
        create: { whatsappId, name }
    });
}
//# sourceMappingURL=user.service.js.map