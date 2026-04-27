import { Test } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../infra/database/prisma.service";
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserResponseDto } from "./dto/user-response.dto";

jest.mock("bcrypt");

describe("UsersService", () => {
    let service: UsersService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let prisma: PrismaService;

    const prismaMock = {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        service = module.get(UsersService);
        prisma = module.get(PrismaService);

        (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("deve criar um usuário com sucesso", async () => {
        const createUserDto = {
            name: "Daniel",
            lastName: "Test",
            email: "test@email.com",
            password: "123456",
        };

        const mockUser = {
            id: "1",
            name: "Daniel",
            lastName: "Test",
            email: "test@email.com",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue(mockUser);

        const result = await service.create(createUserDto);

        expect(result).toHaveProperty("id", "1");
        expect(result.name).toBe("Daniel");
        expect(prismaMock.user.findFirst).toHaveBeenCalled();
        expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it("deve lançar erro se email já existe", async () => {
        const createUserDto = {
            name: "Daniel",
            lastName: "Test",
            email: "existing@email.com",
            password: "123456",
        };

        const existingUser = {
            id: "1",
            email: "existing@email.com",
        };

        prismaMock.user.findFirst.mockResolvedValue(existingUser);

        await expect(service.create(createUserDto)).rejects.toThrow(
            ConflictException,
        );

        expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    // Adicione dentro do describe("UsersService")
    describe("findAll", () => {
        it("deve retornar lista paginada de usuários", async () => {
            const mockUsers = [
                {
                    id: "1",
                    name: "João",
                    lastName: "Silva",
                    email: "joao@email.com",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "2",
                    name: "Maria",
                    lastName: "Santos",
                    email: "maria@email.com",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            prismaMock.$transaction.mockResolvedValue([mockUsers, 2]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(prismaMock.user.findMany).toHaveBeenCalled();
            expect(prismaMock.user.count).toHaveBeenCalled();
        });

        it("deve retornar lista vazia quando não há usuários", async () => {
            prismaMock.$transaction.mockReset();
            prismaMock.$transaction.mockResolvedValue([[], 0]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
        });
    });

    describe("findOne", () => {
        it("deve retornar um usuário pelo id", async () => {
            const mockUser = {
                id: "1",
                name: "João",
                lastName: "Silva",
                email: "joao@email.com",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaMock.user.findFirst.mockResolvedValue(mockUser);

            const result = await service.findOne("1");

            expect(result).toBeInstanceOf(UserResponseDto);
            expect(result.id).toBe("1");
            expect(result.name).toBe("João");
        });

        it("deve lançar NotFoundException se usuário não existe", async () => {
            prismaMock.user.findFirst.mockResolvedValue(null);

            await expect(service.findOne("999")).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("updateOne", () => {
        it("deve atualizar um usuário com sucesso", async () => {
            const existingUser = {
                id: "1",
                name: "João",
                lastName: "Silva",
                email: "joao@email.com",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updateData = {
                name: "João Atualizado",
                lastName: "",
                email: "joao.novo@email.com",
            };

            const updatedUser = {
                ...existingUser,
                ...updateData,
                updatedAt: new Date(),
            };

            prismaMock.user.findFirst.mockResolvedValue(existingUser);
            prismaMock.user.findFirst.mockResolvedValueOnce(existingUser);
            prismaMock.user.findFirst.mockResolvedValueOnce(null);
            prismaMock.user.update.mockResolvedValue(updatedUser);

            const result = await service.updateOne("1", updateData);

            expect(result.name).toBe("João Atualizado");
            expect(prismaMock.user.update).toHaveBeenCalled();
        });

        it("deve lançar BadRequestException se nenhum dado for enviado", async () => {
            const existingUser = {
                id: "1",
                name: "João",
                lastName: "Silva",
                email: "joao@email.com",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaMock.user.findFirst.mockResolvedValue(existingUser);

            await expect(service.updateOne("1", {})).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe("remove", () => {
        it("deve fazer soft delete de um usuário", async () => {
            const existingUser = {
                id: "1",
                name: "João",
                lastName: "Silva",
                email: "joao@email.com",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaMock.user.findFirst.mockResolvedValue(existingUser);
            prismaMock.user.update.mockResolvedValue({
                ...existingUser,
                deletedAt: new Date(),
            });

            const result = await service.remove("1");

            expect(result.message).toBe(true);
            expect(prismaMock.user.update).toHaveBeenCalledWith({
                where: { id: "1" },
                data: { deletedAt: expect.any(Date) },
            });
        });

        it("deve lançar NotFoundException se usuário não existe", async () => {
            prismaMock.user.findFirst.mockResolvedValue(null);

            await expect(service.remove("999")).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
