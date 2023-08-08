import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GuardsModule } from './Guards/guards.module';
import { UserModule } from './Modules/user/user.module';
import { AuthModule } from './Modules/auth/auth.module';
import { ChatModule } from './Modules/chat/chat.module';
import { CloudinaryModule } from './Modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    GuardsModule,
    ChatModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
