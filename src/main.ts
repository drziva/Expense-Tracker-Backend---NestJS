import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());

  app.enableCors({
    origin: ["http://localhost:5173", "http://localhost:4173", process.env.FRONTEND_URL_PROD],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  
  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('API Documentation for the Expense Tracker application')
    .setVersion('1.0')
    .addTag('expenses')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}

bootstrap();
