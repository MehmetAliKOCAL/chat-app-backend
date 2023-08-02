import { Post, Body, HttpCode, Controller, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger/dist/decorators';
import { AuthService } from './auth.service';
import { UserDTO, LoginUserDTO } from 'src/DTOs/user.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Get an auth token by sending valid email and password',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return await this.authService.login(loginUserDTO);
  }

  @ApiOperation({
    summary: 'Register an account',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() userDTO: UserDTO) {
    await this.authService.register(userDTO);
  }
}
