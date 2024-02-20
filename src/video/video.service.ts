import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entity/video.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>
  ) {}

  async findOneById(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
    });
    if (!video) throw new NotFoundException();
    return video;
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
