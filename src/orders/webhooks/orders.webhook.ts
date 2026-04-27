import { Controller, Post, Body } from "@nestjs/common";
import { PrismaService } from "../../infra/database/prisma.service";
import { OrderStatus } from "@prisma/client";

@Controller("webhooks")
export class OrdersWebhookController {
    constructor(private prisma: PrismaService) {}

    @Post("payment")
    async handleWebhook(@Body() body: any) {
        const { externalId, status } = body;

        const order = await this.prisma.order.findUnique({
            where: { externalId },
        });

        if (!order) return;

        // 🔐 idempotência
        if (
            order.status === OrderStatus.COMPLETED ||
            order.status === OrderStatus.FAILED
        ) {
            return;
        }

        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                status:
                    status === "COMPLETED"
                        ? OrderStatus.COMPLETED
                        : OrderStatus.FAILED,
            },
        });
    }
}
