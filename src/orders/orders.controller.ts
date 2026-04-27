import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateOrderDto } from "./dto/create-order.dtio";
import { OrderResponseDto } from "./dto/order-response.dto";

@Controller("orders")
export class OrdersController {
    constructor(private ordersService: OrdersService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() body: CreateOrderDto,
        @Headers("idempotency-key") idempotencyKey: string,
    ) {
        if (!idempotencyKey) {
            throw new BadRequestException("Idempotency-Key é obrigatória");
        }

        return this.ordersService.create(body, idempotencyKey);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<OrderResponseDto[]> {
        return this.ordersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOne(
        @Param("id", ParseUUIDPipe) userId: string,
    ): Promise<OrderResponseDto> {
        return this.ordersService.findOne(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async remove(@Param("id", ParseUUIDPipe) id: string) {
        return this.ordersService.remove(id);
    }
}
