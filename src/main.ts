import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  console.log("JWT SECRET AT BOOT:", process.env.JWT_SECRET);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
