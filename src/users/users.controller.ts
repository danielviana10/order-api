import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserResponseDto } from "./dto/user-response.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async create(@Body() data: CreateUserDto) {
        return this.usersService.create(data);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<UserResponseDto[]> {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOne(
        @Param("id", ParseUUIDPipe) id: string,
    ): Promise<UserResponseDto> {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException("Usuário não encontrado");
        }
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.usersService.updateOne(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async remove(@Param("id", new ParseUUIDPipe()) id: string) {
        return this.usersService.remove(id);
    }
}
