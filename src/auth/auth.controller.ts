import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    async login(@Body() data: LoginDto) {
        return this.authService.login(data.email, data.password);
    }

    @Post("refresh")
    async refresh(@Body() body: { refresh_token: string }) {
        return this.authService.refresh(body.refresh_token);
    }
}
