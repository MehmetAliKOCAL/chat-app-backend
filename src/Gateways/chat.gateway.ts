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
import { WebSocketService } from 'src/Guards/websocket.service';
import { SendToDTO } from 'src/DTOs/chat.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000'],
    credentials: true,
  },
  allowEIO3: true,
})
export class ChatGateway {
  constructor(private webSocket: WebSocketService) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(WebSocketGuard)
  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    const recentlyConnectedUser = await this.webSocket.findUserFromSocket(socket);
    const connectedSockets = await this.server.fetchSockets();
    const connectedUsers = async () =>
      await Promise.all(
        connectedSockets.map(async (socket) => await this.webSocket.findUserFromSocket(socket)),
      ).then((res) => res.filter((user) => user['name'] !== recentlyConnectedUser['name']));

    socket.emit('users', await connectedUsers());
    socket.broadcast.emit('user_connected', recentlyConnectedUser);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    const disconnectedUser = await this.webSocket.findUserFromSocket(socket);
    socket.broadcast.emit('user_disconnected', disconnectedUser);
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody('message')
    message: string,
    @MessageBody('to') to: SendToDTO,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    if (to === null) throw new WsException('Please pick a user before sending a message');
    else if (message === '') throw new WsException("Please don't send empty messages");
    else {
      const messageSender = await this.webSocket.findUserFromSocket(socket);
      const payload = { message, from: messageSender, to };

      socket.to(to.id).emit('message', payload);
      socket.emit('message', payload);
    }
  }
}
