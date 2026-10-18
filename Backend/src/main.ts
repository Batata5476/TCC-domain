import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

function validateRequiredEnv(config: ConfigService) {
  const jwtSecret = config.get<string>('JWT_SECRET');
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET ausente ou insegura. Defina uma string com pelo menos 32 caracteres.');
  }

  const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'NODE_ENV'];
  const missing = requiredEnv.filter((key) => {
    const value = config.get<string | number>(key);
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
  }

  const dbPort = Number(config.get<number>('DB_PORT'));
  if (!Number.isInteger(dbPort) || dbPort <= 0 || dbPort > 65535) {
    throw new Error('DB_PORT deve ser um número inteiro válido entre 1 e 65535.');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  validateRequiredEnv(config);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(config.get<number>('PORT') ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
