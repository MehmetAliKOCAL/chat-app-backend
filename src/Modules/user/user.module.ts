import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, PrismaService, JwtService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
