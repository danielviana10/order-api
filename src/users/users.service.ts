import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../infra/database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { User } from "../../generated/prisma/client";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(data: CreateUserDto): Promise<Omit<User, "password">> {
        const userExists = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (userExists) {
            throw new ConflictException("Email já registrado");
        }

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

    async findAll(): Promise<Omit<User, "password">[]> {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });

        return users;
    }
}
