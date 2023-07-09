import {
  Post,
  Body,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import {
  UserDTO,
  LoginUserDTO,
} from 'src/DTOs/user.dto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger/dist/decorators';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginUserDTO: LoginUserDTO,
  ) {
    return await this.authService.login(
      loginUserDTO,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() userDTO: UserDTO) {
    return await this.authService.register(
      userDTO,
    );
  }
}
