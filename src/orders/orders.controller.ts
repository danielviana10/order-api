import {
    BadRequestException,
    Body,
    Controller,
    Headers,
    Post,
    UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateOrderDto } from "./dto/create-order.dtio";

@Controller("orders")
export class OrdersController {
    constructor(private ordersService: OrdersService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Body() body: CreateOrderDto,
        @Headers("idempotency-key") idempotencyKey: string,
    ) {
        if (!idempotencyKey) {
            throw new BadRequestException("Idempotency-Key é obrigatória");
        }

        return this.ordersService.create(body, idempotencyKey);
    }
}
