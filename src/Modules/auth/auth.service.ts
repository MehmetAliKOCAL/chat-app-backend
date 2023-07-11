import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma.service';
import { UserDTO, LoginUserDTO } from 'src/DTOs/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async login(loginUserDTO: LoginUserDTO) {
    const { email, password } = loginUserDTO;
    const user = await this.userService.findUser(email);

    if (user?.password !== password)
      throw new UnauthorizedException('E-posta veya şifre hatalı.');

    const payload = {
      sub: user.id,
      email: user.email,
    };
    user['auth_token'] = await this.jwt.signAsync(payload);
    delete user.password;

    return user;
  }

  async register(data: UserDTO): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

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
