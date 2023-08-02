import { IsNotEmpty, IsEmail, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class MessageDTO {
  @ApiProperty({ example: 'Hello World!' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SendToDTO {
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
}

export class ChatPayloadDTO {
  @ApiProperty({ example: 'Hello World!' })
  @IsString()
  @IsNotEmpty()
  message: MessageDTO;

  @ApiProperty({
    example:
      "{ name:'John', surname:'Doe', email:'john_doe@hotmail.com', id:'OzWjVXAlI3_L0_ULADKS'  }",
  })
  @IsObject()
  @IsNotEmpty()
  to: SendToDTO;
}
