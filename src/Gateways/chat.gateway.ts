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

@WebSocketGateway({
  cors: {
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000'],
    credentials: true,
  },
  allowEIO3: true,
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.server.emit('message', message);
  }
}
