import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entity/video.entity';
import { S3Service } from '../s3/s3.service';
import { VideoWithSource } from '../types/type';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>,
    private readonly s3Service: S3Service
  ) {}

  async findOneById(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
    });
    if (!video) throw new NotFoundException();
    return video;
  }

  async findOne(id: string): Promise<VideoWithSource> {
    const video = await this.findOneById(id);

    const source = await this.s3Service.getVideoUrl(video.id);
    const videoWithSource: VideoWithSource = {
      ...video,
      source: source,
    };
    return videoWithSource;
  }

  async increaseViewCount(id: string): Promise<void> {
    await this.videoRepository.update(
      { id },
      { viewCount: () => 'view_count + 1' }
    );
  }

  async increaseDownloadCount(id: string): Promise<void> {
    await this.videoRepository.update(
      { id },
      { downloadCount: () => 'download_count + 1' }
    );
  }

  async findTop5Download(): Promise<Video[]> {
    const videos = await this.videoRepository.find({
      order: {
        downloadCount: 'DESC',
      },
      take: 5,
    });
    return videos;
  }
}
