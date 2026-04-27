import { BadRequestException, ValidationPipe } from "@nestjs/common";

export function createValidationPipe() {
    return new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
            const messages = errors.map((err) => {
                if (err.constraints?.whitelistValidation) {
                    return `Propriedade '${err.property}' não é permitida`;
                }

                return Object.values(err.constraints || {});
            });

            return new BadRequestException({
                message: messages.flat(),
                error: "Bad Request",
            });
        },
    });
}
