import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgresConfig from './config/postgres.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
