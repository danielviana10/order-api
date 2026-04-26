import { Body, Controller, Get, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async create(@Body() data: CreateUserDto) {
        return this.usersService.create(data);
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }
}
