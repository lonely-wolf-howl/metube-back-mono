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

async function bootstrap() {
  const port = 4000;
  const app = await NestFactory.create(AppModule);

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

  // ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer
      transform: true,
    })
  );

  app.use(
    cors({
      origin: 'http://localhost:3000',
      methods: 'GET, POST',
    })
  );

  await app.listen(port);
  console.info(`STAGE: ${process.env.STAGE}`);
  console.info(`listening on port ${port}`);
}
bootstrap();
