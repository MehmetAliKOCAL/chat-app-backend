import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { RemoteSocket, Socket } from 'socket.io';

@Injectable()
export class WebSocketService {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async findUserFromSocket(socket: Socket | RemoteSocket<any, any>): Promise<object> {
    const token = socket.handshake.auth.token;
    const { email: userEmail } = await this.jwt.verifyAsync(token, {
      secret: process.env.SECRET_KEY,
    });
    const { name, surname, email } = await this.prisma.user.findFirst({
      where: { email: userEmail },
    });

    return { name, surname, email, id: socket.id };
  }

  async findMessageReceiver(receiverEmail) {
    const { name, surname, email } = await this.prisma.user.findFirst({
      where: { email: receiverEmail },
    });
    return { name, surname, email };
  }
}
