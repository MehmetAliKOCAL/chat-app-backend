import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { WebSocketGuard } from './websocket.guard';

@Module({
  providers: [AuthGuard, WebSocketGuard, JwtService, PrismaService],
})
export class GuardsModule {}
