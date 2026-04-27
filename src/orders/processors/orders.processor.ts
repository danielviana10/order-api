import { Processor, Process } from "@nestjs/bull";
import { Job } from "bullmq";
import { PrismaService } from "../../infra/database/prisma.service";
import { OrderStatus } from "@prisma/client";

@Processor("orders")
export class OrdersProcessor {
    constructor(private prisma: PrismaService) {}

    private async simulateWebhook(externalId: string) {
        await fetch("http://localhost:3000/api/webhooks/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                externalId,
                status: Math.random() < 0.5 ? "FAILED" : "COMPLETED",
            }),
        });
    }

    @Process("process-order")
    async handle(job: Job<{ orderId: string }>) {
        const { orderId } = job.data;

        const externalId = `pay_${Date.now()}`;

        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.PROCESSING,
                externalId,
            },
        });

        setTimeout(() => {
            this.simulateWebhook(externalId).catch(console.error);
        }, 3000);
    }
}
