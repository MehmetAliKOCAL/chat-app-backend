import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WebSocketGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.handshake.auth.token;

    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });
      const user = await this.prisma.user.findFirst({
        where: { email: payload.email },
      });

      delete user.password;
      request.user = user;
      request.user.auth_token = token;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
