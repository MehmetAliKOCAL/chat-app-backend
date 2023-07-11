import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { GuardsModule } from './Guards/guards.module';
import { UserModule } from './Modules/user/user.module';
import { AuthModule } from './Modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    GuardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
