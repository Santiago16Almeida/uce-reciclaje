import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // Permitimos que el Dashboard desde la IP de la Cuenta 3 acceda
    origin: ['http://localhost:5000', 'http://100.50.26.228:5000'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 Gateway operando en http://100.50.26.228:3000/api');
}

bootstrap();
