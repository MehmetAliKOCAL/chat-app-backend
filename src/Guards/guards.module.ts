import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { WebSocketGuard } from './websocket.guard';
import { ChatGateway } from 'src/Gateways/chat.gateway';

@Module({
  providers: [
    AuthGuard,
    WebSocketGuard,
    ChatGateway,
    JwtService,
    PrismaService,
  ],
})
export class GuardsModule {}
