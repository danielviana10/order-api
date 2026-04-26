import { Process, Processor } from "@nestjs/bull";
import { PrismaService } from "../../infra/database/prisma.service";
import { Job } from "bullmq";
import { ProcessOrderJobData } from "../interfaces/orders.interface";

@Processor("orders")
export class OrdersProcessor {
    constructor(private prisma: PrismaService) {}

    @Process("process-order")
    async handle(job: Job<ProcessOrderJobData>) {
        const { orderId } = job.data;

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: "PROCESSING" },
        });

        await new Promise((resolve) => setTimeout(resolve, 5000));

        const success = Math.random() > 0.3;

        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: success ? "COMPLETED" : "FAILED",
            },
        });
    }
}
