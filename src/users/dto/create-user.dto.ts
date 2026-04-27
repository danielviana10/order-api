import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
