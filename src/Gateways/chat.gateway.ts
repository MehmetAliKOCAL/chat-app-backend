import {
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
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
  server;

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const sender = await this.webSocket.findUserFromToken(
      socket.handshake.auth.token,
    );
    const receiver = await this.webSocket.findMessageReceiver(
      socket.handshake.query.to,
    );

    this.server.emit('message', {
      message,
      from: sender,
      to: receiver,
    });
  }
}
