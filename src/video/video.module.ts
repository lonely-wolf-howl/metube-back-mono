import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateVideoHandler } from './handler/create-video.handler';
import { FindVideosQueryHandler } from './handler/find-videos.handler';
import { S3Module } from '../s3/s3.module';
import { FindVideoQueryHandler } from './handler/find-video.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), CqrsModule, S3Module],
  controllers: [VideoController],
  providers: [
    VideoService,
    CreateVideoHandler,
    FindVideosQueryHandler,
    FindVideoQueryHandler,
  ],
  exports: [VideoService],
})
export class VideoModule {}
