import {
  IsNotEmpty,
  IsEmail,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class UserDTO {
  @ApiProperty({ example: 'Barış Manço' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ÖZDEMİR' })
  @IsString()
  surname: string;

  @ApiProperty({
    example: 'baris_manco@hotmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Baris12*423qWE!' })
  @IsString()
  password: string;
}

export class LoginUserDTO {
  @ApiProperty({
    example: 'baris_manco@hotmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Baris12*423qWE!' })
  @IsNotEmpty()
  password: string;
}
