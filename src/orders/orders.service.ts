import { InjectQueue } from "@nestjs/bull";
import { PrismaService } from "../infra/database/prisma.service";
import { Queue } from "bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { CreateOrderDto } from "./dto/create-order.dtio";
import { OrderResponseDto } from "./dto/order-response.dto";

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue("orders") private ordersQueue: Queue,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async create(
        data: CreateOrderDto,
        idempotencyKey: string,
    ): Promise<OrderResponseDto> {
        const { userId, amount } = data;

        const existing = await this.prisma.order.findFirst({
            where: { idempotencyKey },
            select: {
                id: true,
                amount: true,
                status: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (existing) {
            return new OrderResponseDto(existing);
        }

        const order = await this.prisma.order.create({
            data: {
                userId,
                amount,
                idempotencyKey,
            },
            select: {
                id: true,
                amount: true,
                status: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await this.ordersQueue.add("process-order", {
            orderId: order.id,
        });

        return order;
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
