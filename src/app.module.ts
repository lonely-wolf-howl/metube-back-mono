import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgresConfig from './config/postgres.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { VideoModule } from './video/video.module';
import { S3Module } from './s3/s3.module';
import swaggerConfig from './config/swagger.config';
import { ThrottlerModule } from '@nestjs/throttler';
import sentryConfig from './config/sentry.config';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'video',
        ttl: 60, // 1 min
        limit: 20,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, swaggerConfig, sentryConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let object: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          database: configService.get('postgres.database'),
          username: configService.get('postgres.username'),
          password: configService.get('postgres.password'),
          autoLoadEntities: true,
          synchronize: true,
        };
        if (configService.get('STAGE') === 'LOCAL') {
          object = Object.assign(object, {
            logging: false,
          });
        }
        return object;
      },
    }),
    HealthModule,
    VideoModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
