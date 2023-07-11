import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WebSocketService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async findUserFromToken(token: string): Promise<object> {
    const { email: userEmail } = await this.jwt.verifyAsync(token, {
      secret: process.env.SECRET_KEY,
    });
    const { name, surname, email } = await this.prisma.user.findFirst(
      {
        where: { email: userEmail },
      },
    );

    return { name, surname, email };
  }

  async findMessageReceiver(receiverEmail) {
    const { name, surname, email } = await this.prisma.user.findFirst(
      {
        where: { email: receiverEmail },
      },
    );
    return { name, surname, email };
  }
}
