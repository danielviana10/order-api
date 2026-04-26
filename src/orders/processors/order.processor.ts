import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { PrismaService } from "../../infra/database/prisma.service";
import { Job } from "bullmq";
import { ProcessOrderJobData } from "../interfaces/orders.interface";

@Processor("orders")
export class OrdersProcessor {
    constructor(private prisma: PrismaService) {}

    @Process("process-order")
    async handle(job: Job<ProcessOrderJobData>) {
        const { orderId } = job.data;

        console.log(
            `Processando pedido ${orderId} - tentativa ${job.attemptsMade + 1}`,
        );

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: "PROCESSING", updatedAt: new Date() },
        });

        const random = Math.random();

        if (random < 100) {
            console.log("Falha simulada!", [orderId, random]);
            throw new Error("Erro na API de pagamento");
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: "COMPLETED", updatedAt: new Date() },
        });

        console.log(`Pedido ${orderId} processado com sucesso!`);
    }

    @OnQueueFailed()
    async onFailed(job: Job<ProcessOrderJobData>, err: Error) {
        console.log(`Job falhou após retries: ${job.id} - ${err.message}`);

        const { orderId } = job.data;

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: "FAILED" },
        });
    }
}
