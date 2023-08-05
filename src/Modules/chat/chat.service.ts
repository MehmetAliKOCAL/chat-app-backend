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

  async sortMessages(messages: object) {
    const users = Object.keys(messages);
    await Promise.all(
      users.map((user) => {
        messages[user].sort((a: ChatPayloadDTO, b: ChatPayloadDTO) => {
          if (a.createdAt > b.createdAt) return 1;
          else if (a.createdAt < b.createdAt) return -1;
          else return 0;
        });
      }),
    );
  }

  async parseMessages(messages: object) {
    const users = Object.keys(messages);
    await Promise.all(
      users.map((user) => {
        messages[user].forEach((message) => {
          message.from = JSON.parse(message.from);
          message.to = JSON.parse(message.to);
        });
      }),
    );
  }

  async handleConnection(socket: Socket, server: Server) {
    const recentlyConnectedUser = await this.findUserFromSocket(socket);
    const allConnectedUsers = await this.findAllConnectedUsers(server, recentlyConnectedUser);
    socket.emit('users', allConnectedUsers);
    socket.broadcast.emit('user_connected', recentlyConnectedUser);
    this.handleGetChatHistory(socket);
  }

  async handleDisconnect(socket: Socket) {
    const disconnectedUser = await this.findUserFromSocket(socket);
    socket.broadcast.emit('user_disconnected', disconnectedUser);
  }

  async handleGetChatHistory(socket: Socket) {
    const messageSender = await this.findUserFromSocket(socket);
    delete messageSender.id;
    const chatHistory = await this.prisma.message.findMany({
      where: {
        OR: [{ from: JSON.stringify(messageSender) }, { to: JSON.stringify(messageSender) }],
      },
    });
    const messages: object = {};
    await Promise.all(
      chatHistory.map((message) => {
        const messageFrom = JSON.parse(message.from)['email'];
        const messageTo = JSON.parse(message.to)['email'];

        if (messageFrom !== messageSender.email) {
          if (messages[messageFrom] === undefined) messages[messageFrom] = [message];
          else messages[messageFrom].push(message);
        } else {
          if (messages[messageTo] === undefined) messages[messageTo] = [message];
          else messages[messageTo].push(message);
        }
      }),
    ).then(async () => {
      await this.sortMessages(messages);
      await this.parseMessages(messages);
    });

    socket.emit('get_chat_history', messages);
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

    if (sendTo !== undefined) {
      socket.to(sendTo.id).emit('message', updatedPayloadWithUserDetails);
      socket.emit('message', updatedPayloadWithUserDetails);
    } else socket.emit('message', { ...updatedPayloadWithUserDetails, to: JSON.parse(payload.to) });
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

  async handleMessageSeen(
    server: Server,
    socket: Socket,
    messageId: number,
    seenBy: Array<string>,
  ) {
    const currentUser = await this.findUserFromSocket(socket);
    seenBy.push(currentUser.email);
    const updatedMessage = await this.prisma.message.update({
      data: { seenBy },
      where: { id: messageId },
    });
    const to: any = await this.findUserFromEmail(server, JSON.parse(updatedMessage.to)['email']);
    const from: any = await this.findUserFromEmail(
      server,
      JSON.parse(updatedMessage.from)['email'],
    );
    updatedMessage.from = from;
    updatedMessage.to = to;
    socket.emit('message_seen', updatedMessage);
    socket.to([from.id, to.id]).emit('message_seen', updatedMessage);
  }
}
