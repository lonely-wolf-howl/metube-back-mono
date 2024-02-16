import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindVideosQuery } from '../query/find-videos.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from '../entity/video.entity';
import { Repository } from 'typeorm';
import { VideoWithSource } from '../../types/type';
import { S3Service } from '../../s3/s3.service';

@Injectable()
@QueryHandler(FindVideosQuery)
export class FindVideosQueryHandler implements IQueryHandler<FindVideosQuery> {
  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>,
    private readonly s3Service: S3Service
  ) {}

  async execute({ page, size }: FindVideosQuery): Promise<VideoWithSource[]> {
    const videos = await this.videoRepository.find({
      skip: (page - 1) * size,
      take: size,
      order: {
        createdAt: 'DESC',
      },
    });

    const videosWithSource: VideoWithSource[] = [];
    for (const video of videos) {
      const videoId = video.id;
      const source = await this.s3Service.getVideoUrl(videoId);
      const videoWithSource: VideoWithSource = {
        ...video,
        source: source,
      };
      videosWithSource.push(videoWithSource);
    }
    return videosWithSource;
  }
}
