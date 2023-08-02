import {
  Get,
  Post,
  Body,
  Delete,
  Request,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger/dist/decorators';
import { UserDTO } from 'src/DTOs/user.dto';
import { UserService } from './user.service';
import { AuthGuard } from '../../Guards/auth.guard';

@ApiBearerAuth('JWT-auth')
@ApiTags('User Operations')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary:
      'Requires a token | Returns the account details as a json object (Without the password)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('accountDetails')
  async accountDetails(@Request() req): Promise<object> {
    return req.user;
  }

  @ApiOperation({
    summary: 'Requires a token | Updates the account details',
  })
  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateAccountDetails(@Request() req, @Body() userDTO: UserDTO) {
    await this.userService.updateUser({
      where: { id: Number(req.user.id) },
      data: userDTO,
    });
  }

  @ApiOperation({
    summary: 'Requires a token | Deletes the account',
  })
  @HttpCode(HttpStatus.OK)
  @Delete('deleteAccount')
  async deleteAccount(@Request() req) {
    await this.userService.deleteUser({
      id: Number(req.user.id),
    });
  }
}
