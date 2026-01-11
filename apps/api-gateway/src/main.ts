/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = 3000;
    await app.listen(port);
    console.log(`🚀 Gateway listo en: http://localhost:${port}/${globalPrefix}`);
  } catch (error) {
    console.error('❌ EL GATEWAY NO PUDO ARRANCAR:');
    console.error(error); // Esto nos dirá el error real
    process.exit(1);
  }
}
bootstrap();
