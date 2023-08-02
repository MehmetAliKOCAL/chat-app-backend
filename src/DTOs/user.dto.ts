import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class UserDTO {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  surname: string;

  @ApiProperty({
    example: 'john_doe@hotmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John12*423qWE!Doe' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginUserDTO {
  @ApiProperty({
    example: 'john_doe@hotmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John12*423qWE!Doe' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
