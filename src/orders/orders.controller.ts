import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RequestWithUser } from "./interfaces/orders.interface";

@Controller("orders")
export class OrdersController {
    constructor(private ordersService: OrdersService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req: RequestWithUser, @Body() body: { amount: number }) {
        const userId = req.user.userId;
        return this.ordersService.create(userId, body.amount);
    }
}
