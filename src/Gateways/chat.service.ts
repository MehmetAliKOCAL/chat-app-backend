import { Server, RemoteSocket, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { ChatPayloadDTO, UserDTO } from 'src/DTOs/chat.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatService {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async findUserFromSocket(socket: Socket | RemoteSocket<any, any>): Promise<UserDTO> {
    const token = socket.handshake.auth.token;
    const { email: userEmail } = await this.jwt.verifyAsync(token, {
      secret: process.env.SECRET_KEY,
    });
    const { name, surname, email } = await this.prisma.user.findFirst({
      where: { email: userEmail },
    });

    return { name, surname, email, id: socket.id };
  }

  async findUserFromEmail(server: Server, email: string) {
    const sockets = await server.fetchSockets();
    let user: UserDTO;
    await Promise.all(
      sockets.map(async (socket) => {
        if (socket.handshake.query.userEmail === email) {
          user = await this.findUserFromSocket(socket);
        }
      }),
    );
    return user;
  }

  async findAllConnectedUsers(server: Server, recentlyConnectedUser: object) {
    const connectedSockets = await server.fetchSockets();
    return await Promise.all(
      connectedSockets.map(async (socket) => await this.findUserFromSocket(socket)),
    ).then((allUsers) => allUsers.filter((user) => user['name'] !== recentlyConnectedUser['name']));
  }

  async handleConnection(socket: Socket, server: Server) {
    const recentlyConnectedUser = await this.findUserFromSocket(socket);
    const allConnectedUsers = await this.findAllConnectedUsers(server, recentlyConnectedUser);
    socket.emit('users', allConnectedUsers);
    socket.broadcast.emit('user_connected', recentlyConnectedUser);
  }

  async handleDisconnect(socket: Socket) {
    const disconnectedUser = await this.findUserFromSocket(socket);
    socket.broadcast.emit('user_disconnected', disconnectedUser);
  }

  async handleChatHistory(socket: Socket, messageReceiver: UserDTO) {
    const messageSender = await this.findUserFromSocket(socket);
    delete messageSender.id;
    delete messageReceiver.id;
    const chatHistory = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            AND: [{ from: JSON.stringify(messageSender) }, { to: JSON.stringify(messageReceiver) }],
          },
          {
            AND: [{ from: JSON.stringify(messageReceiver) }, { to: JSON.stringify(messageSender) }],
          },
        ],
      },
    });
    await Promise.all(
      chatHistory.map((message) => {
        message.from = JSON.parse(message.from);
        message.to = JSON.parse(message.to);
      }),
    ).then(() => {
      chatHistory.sort((a, b) => {
        if (a.createdAt > b.createdAt) return 1;
        else if (a.createdAt < b.createdAt) return -1;
        else return 0;
      });
    });

    socket.emit('chat_history', chatHistory);
  }

  async handleMessage(message: string, to: UserDTO, socket: Socket, server: Server) {
    const messageSender: UserDTO = await this.findUserFromSocket(socket);
    delete messageSender.id;
    delete to.id;
    const payload = await this.prisma.message.create({
      data: {
        message,
        from: JSON.stringify(messageSender),
        to: JSON.stringify(to),
        seenBy: [messageSender.email],
        isDeleted: false,
      },
    });
    const sendTo = await this.findUserFromEmail(server, JSON.parse(payload.to).email);
    const updatedPayloadWithUserDetails = { ...payload, to: sendTo, from: messageSender };
    socket.to(sendTo.id).emit('message', updatedPayloadWithUserDetails);
    socket.emit('message', updatedPayloadWithUserDetails);
  }

  async handleDeleteMessage(server: Server, socket: Socket, payload: ChatPayloadDTO) {
    const updatedPayload = await this.prisma.message.update({
      data: { isDeleted: true },
      where: { id: payload.id },
    });
    const updatedPayloadWithUserDetails = {
      ...updatedPayload,
      from: JSON.parse(updatedPayload.from),
      to: JSON.parse(updatedPayload.to),
    };
    socket.emit('message_deleted', updatedPayloadWithUserDetails);
    const to = await this.findUserFromEmail(server, payload.to.email);
    socket.to(to['id']).emit('message_deleted', updatedPayloadWithUserDetails);
  }
}
