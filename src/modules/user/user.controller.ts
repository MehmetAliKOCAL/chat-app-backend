import {
  Get,
  Post,
  Body,
  Request,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../../guard/auth.guard';
import { UserDTO } from 'src/DTOs/user.dto';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';

@ApiBearerAuth('JWT-auth')
@ApiTags('Kullanıcı İşlemleri')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary:
      'TOKEN GEREKTİRİR | Hesap detaylarını içeren veriyi çeker (Hesap şifresi hariç)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('accountDetails')
  async accountDetails(
    @Request() req,
  ): Promise<object> {
    return req.user;
  }

  @ApiOperation({
    summary:
      'TOKEN GEREKTİRİR | Hesap detaylarını günceller',
  })
  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateAccountDetails(
    @Request() req,
    @Body() userDTO: UserDTO,
  ) {
    await this.userService.updateUser({
      where: { id: Number(req.user.id) },
      data: userDTO,
    });
  }
}
