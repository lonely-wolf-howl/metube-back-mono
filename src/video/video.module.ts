import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateVideoCommandHandler } from './handler/create-video.handler';
import { FindVideosQueryHandler } from './handler/find-videos.handler';
import { FindVideoQueryHandler } from './handler/find-video.handler';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), CqrsModule, S3Module],
  controllers: [VideoController],
  providers: [
    VideoService,
    CreateVideoCommandHandler,
    FindVideosQueryHandler,
    FindVideoQueryHandler,
  ],
  exports: [VideoService],
})
export class VideoModule {}
