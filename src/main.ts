import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { createValidationPipe } from "./common/pipes/validation.pipe";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(createValidationPipe());

    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalInterceptors(new LoggingInterceptor());

    app.enableCors();
    app.setGlobalPrefix("api");

    const port = process.env.PORT ?? 3000;
    await app.listen(port);

    console.log(`Aplicação rodando em http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
    console.error("Erro ao iniciar a aplicação:", error);
    process.exit(1);
});
