import { InjectQueue } from "@nestjs/bull";
import { PrismaService } from "../infra/database/prisma.service";
import { Queue } from "bullmq";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
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

    orderSelect = {
        id: true,
        amount: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
    };

    private async findOrderOrThrow(userId?: string, orderId?: string) {
        const order = await this.prisma.order.findFirst({
            where: {
                OR: [
                    { userId: userId || undefined },
                    { id: orderId || undefined },
                ],
                deletedAt: null,
            },
            select: this.orderSelect,
        });

        if (!order) {
            throw new NotFoundException("Pedido não encontrado");
        }

        return order;
    }

    async create(
        data: CreateOrderDto,
        idempotencyKey: string,
    ): Promise<OrderResponseDto> {
        const { userId, amount } = data;

        const existing = await this.prisma.order.findFirst({
            where: { idempotencyKey },
            select: this.orderSelect,
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
            select: this.orderSelect,
        });

        await this.ordersQueue.add("process-order", {
            orderId: order.id,
        });

        return order;
    }

    async findOne(userId: string): Promise<OrderResponseDto> {
        const order = await this.findOrderOrThrow(userId);

        return order;
    }

    async findAll(): Promise<OrderResponseDto[]> {
        const orders = await this.prisma.order.findMany({
            where: { deletedAt: null },
            select: this.orderSelect,
            orderBy: {
                createdAt: "desc",
            },
        });

        return orders.map((orders) => new OrderResponseDto(orders));
    }

    async remove(id: string) {
        await this.findOrderOrThrow(id);

        await this.prisma.order.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        return { message: true };
    }
}
