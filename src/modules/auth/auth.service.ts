import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  UserDTO,
  LoginUserDTO,
} from 'src/DTOs/user.dto';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(loginUserDTO: LoginUserDTO) {
    const { email, password } = loginUserDTO;
    const user = await this.userService.findUser(
      email,
    );

    if (user?.password !== password)
      throw new UnauthorizedException(
        'E-posta veya şifre hatalı.',
      );

    const payload = {
      sub: user.id,
      email: user.email,
    };
    return {
      access_token: await this.jwt.signAsync(
        payload,
      ),
    };
  }

  async register(data: UserDTO): Promise<User> {
    const user = await this.prisma.user.findFirst(
      {
        where: { email: data.email },
      },
    );

    if (user)
      throw new HttpException(
        'Bu e-posta adresine ait bir kullanıcı zaten var.',
        HttpStatus.FOUND,
      );
    else
      return await this.prisma.user.create({
        data,
      });
  }
}
