import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as session from 'express-session';
import * as passport from 'passport';
import * as basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const port = 4000;
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60 * 60 * 1000, // 1 hour
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

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
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, customOptions);

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
  console.info(`STAGE: ${process.env.STAGE}`);
  console.info(`listening on port ${port}`);
}
bootstrap();
