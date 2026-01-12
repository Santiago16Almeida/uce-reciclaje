import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para que tu Dashboard (puerto 5000) pueda conectarse
  app.enableCors({
    origin: 'http://localhost:5000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // 2. Prefijo global para que todas las rutas empiecen con /api
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 Gateway corriendo en http://localhost:3000/api');
}
bootstrap();
