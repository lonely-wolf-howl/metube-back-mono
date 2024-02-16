import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindVideoQuery } from '../query/find-video.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from '../entity/video.entity';
import { Repository } from 'typeorm';
import { VideoWithSource } from '../../types/type';
import { S3Service } from '../../s3/s3.service';

@Injectable()
@QueryHandler(FindVideoQuery)
export class FindVideoQueryHandler implements IQueryHandler<FindVideoQuery> {
  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>,
    private readonly s3Service: S3Service
  ) {}

  async execute({ id }: FindVideoQuery): Promise<VideoWithSource> {
    const video = await this.videoRepository.findOne({
      where: { id },
    });

    const source = await this.s3Service.getVideoUrl(video.id);
    const videoWithSource: VideoWithSource = {
      ...video,
      source: source,
    };
    return videoWithSource;
  }
}
