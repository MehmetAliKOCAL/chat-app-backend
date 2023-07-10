import {
  Post,
  Body,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger/dist/decorators';
import { AuthService } from './auth.service';
import { UserDTO, LoginUserDTO } from 'src/DTOs/user.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'E-posta ve şifre göndererek auth tokeni al',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return await this.authService.login(loginUserDTO);
  }

  @ApiOperation({
    summary: 'Kayıt ol',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() userDTO: UserDTO) {
    await this.authService.register(userDTO);
  }
}
