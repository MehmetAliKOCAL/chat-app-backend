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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger/dist/decorators';
import { UserDTO } from 'src/DTOs/user.dto';
import { UserService } from './user.service';
import { AuthGuard } from '../../Guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@ApiBearerAuth('JWT-auth')
@ApiTags('User Operations')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService, private cloudinaryService: CloudinaryService) {}

  @ApiOperation({
    summary:
      'Requires a token | Returns the account details as a json object (Without the password)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('accountDetails')
  async accountDetails(@Request() request): Promise<object> {
    return request.user;
  }

  @ApiOperation({
    summary: 'Requires a token | Updates the account details',
  })
  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateAccountDetails(@Request() request, @Body() updatedUser: UserDTO) {
    await this.userService.updateUser(request.user.id, updatedUser);
  }

  @ApiOperation({
    summary: 'Requires a token | Deletes the account',
  })
  @HttpCode(HttpStatus.OK)
  @Delete('deleteAccount')
  async deleteAccount(@Request() request) {
    await this.userService.deleteUser(request.user.id);
  }

  @ApiOperation({
    summary: 'Requires a token | Upload a profile picture for the authenticated user',
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @Post('uploadPFP')
  async uploadPFP(@Request() request, @UploadedFile() file: Express.Multer.File) {
    return await this.userService.uploadPFP(file, request.user.email);
  }
}
