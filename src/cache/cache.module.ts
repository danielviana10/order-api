import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import * as redisStore from "cache-manager-ioredis";

@Module({
    imports: [
        CacheModule.register({
            isGlobal: true,
            store: redisStore,
            host: "localhost",
            port: 6379,
            ttl: 120,
            connectTimeout: 3000,
            maxRetriesPerRequest: 1,
            enableReadyCheck: false,
            reconnectOnError: () => false,
        }),
    ],
    exports: [CacheModule],
})
export class AppCacheModule {}
