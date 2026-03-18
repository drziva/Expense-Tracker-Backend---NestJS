import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
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
