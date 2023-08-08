import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  providers: [UserService, PrismaService, JwtService, CloudinaryService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
