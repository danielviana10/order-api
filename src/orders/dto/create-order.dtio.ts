import { IsNumber, IsUUID } from "class-validator";

export class CreateOrderDto {
    @IsUUID()
    userId: string;

    @IsNumber()
    amount: number;
}
