import {
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WebSocketGuard } from 'src/Guards/websocket.guard';
import { ChatService } from 'src/Modules/chat/chat.service';
import { ChatPayloadDTO, UserDTO } from 'src/DTOs/chat.dto';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway({
  cors: {
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000'],
    credentials: true,
  },
  allowEIO3: true,
})
export class ChatGateway {
  constructor(private chatService: ChatService, private prisma: PrismaService) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(WebSocketGuard)
  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    this.chatService.handleConnection(socket, this.server);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    this.chatService.handleDisconnect(socket);
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody('message')
    message: string,
    @MessageBody('to') to: UserDTO,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    if (to === null) throw new WsException('Please pick a user before sending a message');
    else if (message === '') throw new WsException("Please don't send empty messages");
    else {
      this.chatService.handleMessage(message, to, socket, this.server);
    }
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @MessageBody() payload: ChatPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.chatService.handleDeleteMessage(this.server, socket, payload);
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('message_seen')
  async handleMessageSeen(
    @MessageBody('message') message: ChatPayloadDTO,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.chatService.handleMessageSeen(this.server, socket, message);
  }
}
