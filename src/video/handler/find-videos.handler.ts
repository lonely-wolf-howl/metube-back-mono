import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindVideosQuery } from '../query/find-videos.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from '../entity/video.entity';
import { Repository } from 'typeorm';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { VideoWithSource } from '../../types/type';

@Injectable()
@QueryHandler(FindVideosQuery)
export class FindVideosQueryHandler implements IQueryHandler<FindVideosQuery> {
  private readonly s3Client: S3Client;

  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>
  ) {
    this.s3Client = new S3Client({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async execute({ page, size }: FindVideosQuery): Promise<any> {
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
      const source = await this.getVideoUrlFromS3(videoId);
      const videoWithSource: VideoWithSource = {
        ...video,
        source: source,
      };
      videosWithSource.push(videoWithSource);
    }
    return videosWithSource;
  }

  async getVideoUrlFromS3(videoId: string): Promise<string> {
    try {
      const url = `https://${process.env.AWS_S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${videoId}`;
      return url;
    } catch (error) {
      throw error;
    }
  }

  async downloadVideoFromS3(videoId: string): Promise<Buffer> {
    try {
      const { Body } = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: videoId,
        })
      );
      const stream = Body as Readable;
      const chunks: Uint8Array[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      throw error;
    }
  }
}
