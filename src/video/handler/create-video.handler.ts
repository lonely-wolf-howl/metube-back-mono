import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { CreateVideoCommand } from '../command/create-video.command';
import { Video } from '../entity/video.entity';
import { S3Service } from '../../s3/s3.service';
import { VideoCreatedEvent } from '../event/video-created.event';

@Injectable()
@CommandHandler(CreateVideoCommand)
export class CreateVideoHandler implements ICommandHandler<CreateVideoCommand> {
  constructor(
    private dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly eventBus: EventBus
  ) {}

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

      await this.s3Service.uploadVideo(video.id, buffer);
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
}
