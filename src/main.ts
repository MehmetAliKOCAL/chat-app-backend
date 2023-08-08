import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
  });
  const config = new DocumentBuilder()
    .setTitle('Chat API Documentation')
    .setDescription(
      "You can check the endpoints, what object to send them or which http method they work with in this documentation. To be able to test all the endpoints, you can create an account from the register endpoint below if you haven't done it yet, and then login by using login endpoint. This way you'll get a jwt auth key, copy it and click green 'Authorize' button below. Paste your key, now you can start trying other endpoints that aren't below 'Authorization' header. ",
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token (You can get it by logging in)',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT);
}
bootstrap();
