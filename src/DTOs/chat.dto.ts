import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsObject,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class MessageDTO {
  @ApiProperty({ example: 'Hello World!' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UserDTO {
  @ApiProperty({
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    example: 'john_doe@hotmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'OzWjVXAlI3_L0_ULADKS',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'https://picsum.photos/200/200',
  })
  @IsString()
  profile_picture: string;
}

export class ChatPayloadDTO {
  @ApiProperty({ example: '14' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'Hello World!' })
  @IsString()
  @IsNotEmpty()
  message: MessageDTO;

  @ApiProperty({
    example:
      "{ name:'Jane', surname:'Doe', email:'jane_doe@hotmail.com', id:'tYwsVXAlI3_L0_PoADLK'  }",
  })
  @IsObject()
  @IsNotEmpty()
  author: UserDTO;

  @ApiProperty({
    example:
      "{ name:'John', surname:'Doe', email:'john_doe@hotmail.com', id:'OzWjVXAlI3_L0_ULADKS'  }",
  })
  @IsObject()
  @IsNotEmpty()
  sentTo: UserDTO;

  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isDeleted: boolean;

  @ApiProperty({
    example: false,
  })
  @IsArray()
  @IsNotEmpty()
  seenBy: string[];

  @ApiProperty({
    example: '2023-08-04T06:23:55.832Z',
  })
  @IsDate()
  createdAt: Date;
}
