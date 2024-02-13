import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { CreateVideoCommand } from '../command/create-video.command';
import { Video } from '../entity/video.entity';
import { VideoCreatedEvent } from '../event/video-created.event';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
@CommandHandler(CreateVideoCommand)
export class CreateVideoHandler implements ICommandHandler<CreateVideoCommand> {
  private readonly s3Client: S3Client;

  constructor(
    private dataSource: DataSource,
    private readonly eventBus: EventBus
  ) {
    this.s3Client = new S3Client({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async execute(command: CreateVideoCommand): Promise<any> {
    const { title, displayName, email, mimetype, buffer } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    let error: any;
    try {
      const video = await queryRunner.manager.save(
        queryRunner.manager.create(Video, {
          title,
          displayName,
          email,
          mimetype,
        })
      );

      await this.uploadVideo(video.id, buffer);
      await queryRunner.commitTransaction();

      this.eventBus.publish(new VideoCreatedEvent(video.id));

      return video;
    } catch (transactionError) {
      await queryRunner.rollbackTransaction();
      error = transactionError;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  private async uploadVideo(fileName: string, buffer: Buffer) {
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
}
