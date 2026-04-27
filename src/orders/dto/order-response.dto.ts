export class OrderResponseDto {
    id: string;
    amount: number;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<OrderResponseDto>) {
        Object.assign(this, partial);
    }
}
