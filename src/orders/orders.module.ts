import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { BullModule } from "@nestjs/bull";
import { OrdersProcessor } from "./processors/orders.processor";
import { OrdersWebhookController } from "./webhooks/orders.webhook";

@Module({
    imports: [
        BullModule.registerQueue({
            name: "orders",
        }),
    ],
    controllers: [OrdersController, OrdersWebhookController],
    providers: [OrdersService, OrdersProcessor],
})
export class OrdersModule {}
