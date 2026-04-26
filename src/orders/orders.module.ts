import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { BullModule } from "@nestjs/bull";
import { OrdersProcessor } from "./processors/order.processor";

@Module({
    imports: [
        BullModule.registerQueue({
            name: "orders",
        }),
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersProcessor],
})
export class OrdersModule {}
