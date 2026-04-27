import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../infra/database/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const access_token = this.jwtService.sign(payload, {
            expiresIn: "15m",
        });

        const refresh_token = this.jwtService.sign(payload, {
            expiresIn: "7d",
        });

        const hashedRefresh = await bcrypt.hash(refresh_token, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: hashedRefresh,
            } as any,
        });

        return {
            access_token,
            refresh_token,
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException();
            }

            const isMatch = await bcrypt.compare(
                refreshToken,
                user.refreshToken as string,
            );

            if (!isMatch) {
                throw new UnauthorizedException();
            }

            const newAccessToken = this.jwtService.sign(
                {
                    sub: user.id,
                    email: user.email,
                },
                {
                    expiresIn: "15m",
                },
            );

            return {
                access_token: newAccessToken,
            };
        } catch {
            throw new UnauthorizedException("Refresh inválido");
        }
    }
}
