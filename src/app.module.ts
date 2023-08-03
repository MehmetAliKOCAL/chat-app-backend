import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GuardsModule } from './Guards/guards.module';
import { UserModule } from './Modules/user/user.module';
import { AuthModule } from './Modules/auth/auth.module';
import { ChatModule } from './Gateways/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    GuardsModule,
    ChatModule,
  ],
})
export class AppModule {}
