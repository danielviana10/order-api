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
import { PaginationDto } from "../dto/paginated-response.dto";
import { UserPaginatedResponseDto } from "./dto/user-paginated-response.dto";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    userSelect = {
        id: true,
        name: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
    };

    private async findActiveUserOrThrow(id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: this.userSelect,
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
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
            },
            select: this.userSelect,
        });

        return user;
    }

    async findAll(
        pagination: PaginationDto,
    ): Promise<UserPaginatedResponseDto> {
        const { page = 1, limit = 10 } = pagination;

        const skip = (page - 1) * limit;

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                select: this.userSelect,
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where: { deletedAt: null },
            }),
        ]);

        const userDtos = users.map((user) => new UserResponseDto(user));

        return new UserPaginatedResponseDto(userDtos, total, page, limit);
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
            select: this.userSelect,
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
