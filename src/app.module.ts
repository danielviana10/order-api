import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { OrdersModule } from "./orders/orders.module";
import { AuthModule } from "./auth/auth.module";
import { QueueModule } from "./infra/queue/queue.module";
import { AppCacheModule } from "./cache/cache.module";

@Module({
    imports: [
        UsersModule,
        OrdersModule,
        AuthModule,
        QueueModule,
        AppCacheModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
