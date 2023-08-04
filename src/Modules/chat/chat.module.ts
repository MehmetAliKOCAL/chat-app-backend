import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ChatService } from './chat.service';
import { ChatGateway } from '../../Gateways/chat.gateway';

@Module({
  providers: [ChatService, ChatGateway, JwtService, PrismaService],
})
export class ChatModule {}
