import { InjectQueue } from "@nestjs/bull";
import { PrismaService } from "../infra/database/prisma.service";
import { Queue } from "bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue("orders") private ordersQueue: Queue,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async create(userId: string, amount: number) {
        const order = await this.prisma.order.create({
            data: {
                userId,
                amount,
                status: OrderStatus.PENDING,
            },
        });

        try {
            await this.ordersQueue.add(
                "process-order",
                { orderId: order.id },
                {
                    attempts: 5,
                    backoff: { type: "exponential", delay: 2000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            );
        } catch (error) {
            console.error("⚠️ Redis indisponível, job não enfileirado:", error);
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.FAILED },
            });
        }

        try {
            await this.cacheManager.del(`orders:${userId}`);
        } catch (error) {
            console.warn("Redis indisponível, cache não validado", error);
        }
    }

    async findAll(userId: string) {
        const cacheKey = `orders:${userId}`;

        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            return cached;
        }

        const orders = await this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        await this.cacheManager.set(cacheKey, orders, 120);

        return orders;
    }
}
