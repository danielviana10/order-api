import { InjectQueue } from "@nestjs/bull";
import { PrismaService } from "../infra/database/prisma.service";
import { Queue } from "bullmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue("orders") private ordersQueue: Queue,
    ) {}

    async create(userId: string, amount: number) {
        const order = await this.prisma.order.create({
            data: {
                userId,
                amount,
                status: "PENDING",
            },
        });

        await this.ordersQueue.add(
            "process-order",
            {
                orderId: order.id,
            },
            {
                attempts: 5,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        );

        return order;
    }
}
