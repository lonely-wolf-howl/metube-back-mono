import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: process.env.STAGE === 'PRODUCTION' ? 'info' : 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike('metube', { prettyPrint: true })
          ),
        }),
      ],
    }),
  });
  const port = 4000;
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  // Swagger
  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [configService.get('swagger.user')]:
          configService.get('swagger.password'),
      },
    })
  );
  const config = new DocumentBuilder()
    .setTitle('MeTube')
    .setDescription('MeTube API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // ValidationPipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  app.use(
    cors({
      origin: 'http://localhost:3000',
      methods: 'GET, POST',
    })
  );

  // Interceptors
  app.useGlobalInterceptors(
    new SentryInterceptor(),
    new TransformInterceptor()
  );

  await app.listen(port);
  Logger.log(`STAGE: ${process.env.STAGE}`);
  Logger.log(`listening on port ${port}`);
}
bootstrap();
