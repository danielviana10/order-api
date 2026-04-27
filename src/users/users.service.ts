import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../infra/database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { UserResponseDto } from "./dto/user-response.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { validateEmailUniqueness } from "./utils/validate-email";
import { buildUserUpdateData } from "./utils/build-user-update-data";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    private async findActiveUserOrThrow(id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });

        if (!user) {
            throw new NotFoundException("Usuário não encontrado");
        }

        return user;
    }

    async create(data: CreateUserDto): Promise<UserResponseDto> {
        await validateEmailUniqueness(this.prisma, data.email);

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });

        return user;
    }

    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
            where: {
                deletedAt: null,
            },
        });

        return users.map((user) => new UserResponseDto(user));
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.findActiveUserOrThrow(id);

        return new UserResponseDto(user);
    }

    async updateOne(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.findActiveUserOrThrow(id);

        if (data.email && data.email !== existingUser.email) {
            await validateEmailUniqueness(this.prisma, data.email, id);
        }

        const updateData = await buildUserUpdateData(data);

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException("Nenhum dado para atualizar");
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return new UserResponseDto(updatedUser);
    }

    async remove(id: string) {
        await this.findActiveUserOrThrow(id);

        await this.prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        return { message: true };
    }
}
