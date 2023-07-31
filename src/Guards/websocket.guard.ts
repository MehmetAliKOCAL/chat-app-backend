import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WebSocketGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.handshake.auth.token;

    if (!token)
      throw new WsException(
        'You have to login before joining a chat',
      );
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });
      const user = await this.prisma.user.findFirst({
        where: { email: payload.email },
      });

      delete user.password;
      request.user = user;
      request.user.auth_token = token;
    } catch {
      throw new WsException('Server has failed to fetch user data');
    }
    return true;
  }
}
