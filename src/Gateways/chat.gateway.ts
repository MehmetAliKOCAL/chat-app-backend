import {
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WebSocketGuard } from 'src/Guards/websocket.guard';
import { WebSocketService } from 'src/Guards/websocket.service';

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
  @SubscribeMessage('connection')
  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    const sender = await this.webSocket.findUserFromSocket(socket);
    const connectedSockets = await this.server.fetchSockets();
    const connectedUsers = async () =>
      await Promise.all(
        connectedSockets.map(async (socket) => await this.webSocket.findUserFromSocket(socket)),
      ).then((res) => res.filter((user) => user['name'] !== sender['name']));

    socket.emit('users', await connectedUsers());
    socket.broadcast.emit('user_connected', sender);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    const sender = await this.webSocket.findUserFromSocket(socket);

    socket.broadcast.emit('user_disconnected', sender);
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody('message') message: object,
    @MessageBody('to') to: object,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const sender = await this.webSocket.findUserFromSocket(socket);
    const newPayload = { message, from: sender, to };

    socket.to(to['id']).emit('message', newPayload);
    socket.emit('message', newPayload);
  }
}
