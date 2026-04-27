import { ConflictException } from "@nestjs/common";
import { PrismaService } from "../../infra/database/prisma.service";

export async function validateEmailUniqueness(
    prisma: PrismaService,
    email: string,
    userId?: string,
) {
    const emailExists = await prisma.user.findFirst({
        where: {
            email,
            deletedAt: null,
            ...(userId && { NOT: { id: userId } }),
        },
    });

    if (emailExists) {
        throw new ConflictException("Email já registrado");
    }
}
