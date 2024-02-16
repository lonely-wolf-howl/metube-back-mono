import { Injectable, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../video/entity/video.entity';

@Injectable()
export class S3Service {
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

  async uploadVideo(fileName: string, buffer: Buffer): Promise<void> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
          Body: buffer,
          ACL: 'public-read',
        })
      );
    } catch (error) {
      throw error;
    }
  }

  async getVideoUrl(videoId: string): Promise<string> {
    try {
      const url = `https://${process.env.AWS_S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${videoId}`;
      return url;
    } catch (error) {
      throw error;
    }
  }

  async downloadVideo(
    videoId: string
  ): Promise<{ stream: Readable; mimetype: string; size: number }> {
    try {
      const { Body, ContentLength } = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: videoId,
        })
      );
      const stream = Body as Readable;
      const size = ContentLength;

      const video = await this.videoRepository.findOne({
        where: { id: videoId },
      });
      if (!video) throw new NotFoundException();
      const { mimetype } = video;

      return { stream, mimetype, size };
    } catch (error) {
      throw error;
    }
  }
}
