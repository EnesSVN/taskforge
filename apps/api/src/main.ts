import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const portFromEnv = config.get<string>('PORT');
  const port = Number(portFromEnv) || 4000;

  console.log('[BOOT] PORT from env =', portFromEnv);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
