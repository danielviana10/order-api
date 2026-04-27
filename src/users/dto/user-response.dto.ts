export class UserResponseDto {
    id: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
