import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();

        const request = context.switchToHttp().getRequest<Request>();
        const { method, url } = request;

        return next.handle().pipe(
            tap(() => {
                const responseTime = Date.now() - now;

                console.log(`[${method}] ${url} - ${responseTime}ms`);
            }),
        );
    }
}
