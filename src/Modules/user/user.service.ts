import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserDTO } from 'src/DTOs/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

  async findUser(email: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { email: email },
    });
  }

  async updateUser(userID: number, updatedUser: UserDTO): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userID },
      data: updatedUser,
    });
  }

  async deleteUser(userID: number): Promise<User> {
    return await this.prisma.user.delete({
      where: {
        id: userID,
      },
    });
  }

  async uploadPFP(file: Express.Multer.File, userEmail: string): Promise<any> {
    const { secure_url: imageURL } = await this.cloudinary.uploadFile(file);
    return await this.prisma.user.update({
      data: { profile_picture: imageURL },
      where: { email: userEmail },
    });
  }
}
