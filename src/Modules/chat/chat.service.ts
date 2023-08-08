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
    const { name, surname, email, profile_picture } = await this.prisma.user.findFirst({
      where: { email: userEmail },
      include: {
        messagesSent: false,
        messagesTaken: false,
      },
    });

    return { name, surname, email, profile_picture, id: socket.id };
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

  async sortMessages(allMessages: object) {
    const users = Object.keys(allMessages);
    await Promise.all(
      users.map((user) => {
        allMessages[user].messages.sort((a: ChatPayloadDTO, b: ChatPayloadDTO) => {
          if (a.createdAt > b.createdAt) return 1;
          else if (a.createdAt < b.createdAt) return -1;
          else return 0;
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
    const thisUser = await this.findUserFromSocket(socket);
    const allMessages = await this.prisma.message.findMany({
      where: {
        OR: [{ authorEmail: thisUser.email }, { sentToEmail: thisUser.email }],
      },
      include: {
        author: true,
        sentTo: true,
      },
    });
    const chatHistory: object = {};
    await Promise.all(
      allMessages.map(async (message) => {
        delete message.author.password;
        delete message.sentTo.password;
        if (message.authorEmail !== thisUser.email) {
          if (chatHistory[message.authorEmail] === undefined)
            chatHistory[message.authorEmail] = { user: message.author, messages: [message] };
          else chatHistory[message.authorEmail].messages.push(message);
        } else {
          if (chatHistory[message.sentToEmail] === undefined)
            chatHistory[message.sentToEmail] = { user: message.sentTo, messages: [message] };
          else chatHistory[message.sentToEmail].messages.push(message);
        }
      }),
    ).then(async () => {
      await this.sortMessages(chatHistory);
    });
    socket.emit('get_chat_history', chatHistory);
  }

  async handleMessage(message: string, to: UserDTO, socket: Socket, server: Server) {
    const messageSender: UserDTO = await this.findUserFromSocket(socket);
    const payload = await this.prisma.message.create({
      data: {
        message,
        authorEmail: messageSender.email,
        sentToEmail: to.email,
        seenBy: [messageSender.email],
        isDeleted: false,
      },
      include: {
        author: true,
        sentTo: true,
      },
    });
    const sentTo = await this.findUserFromEmail(server, payload?.sentToEmail);

    socket.emit('message', payload);
    if (sentTo?.id !== undefined) socket.to(sentTo.id).emit('message', payload);
  }

  async handleDeleteMessage(server: Server, socket: Socket, payload: ChatPayloadDTO) {
    const updatedPayload = await this.prisma.message.update({
      data: { isDeleted: true },
      where: { id: payload.id },
    });

    socket.emit('message_deleted', updatedPayload);
    const sentTo = await this.findUserFromEmail(server, payload.sentTo.email);
    if (sentTo !== undefined) socket.to(sentTo.id).emit('message_deleted', updatedPayload);
  }

  async handleMessageSeen(server: Server, socket: Socket, message: ChatPayloadDTO) {
    const thisUser = await this.findUserFromSocket(socket);
    message.seenBy.push(thisUser.email);
    const updatedMessage = await this.prisma.message.update({
      data: { seenBy: message.seenBy },
      where: { id: message.id },
    });
    const author = await this.findUserFromEmail(server, updatedMessage.authorEmail);
    const sentTo = await this.findUserFromEmail(server, updatedMessage.sentToEmail);
    updatedMessage['author'] = author;
    updatedMessage['sentTo'] = sentTo;
    socket.emit('message_seen', updatedMessage);
    socket.to([author.id, sentTo.id]).emit('message_seen', updatedMessage);
  }
}
