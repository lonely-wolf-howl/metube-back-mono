import { TestingModule, Test } from '@nestjs/testing';
import { CreateVideoCommandHandler } from './create-video.handler';
import { CreateVideoCommand } from '../command/create-video.command';
import { DataSource } from 'typeorm';
import { Video } from '../entity/video.entity';
import { EventBus } from '@nestjs/cqrs';
import { S3Service } from '../../s3/s3.service';

class QueryRunner {
  private readonly manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
  }

  async startTransaction() {
    return;
  }
  async commitTransaction() {
    return;
  }
  async rollbackTransaction() {
    return;
  }
  async release() {
    return;
  }
}

class Manager {
  async create(video: Video) {
    return video;
  }
  async save(video: Video) {
    return video;
  }
}

describe('CreateVideoHandler', () => {
  let handler: CreateVideoCommandHandler;
  let eventBus: jest.Mocked<EventBus>;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVideoCommandHandler,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest
              .fn()
              .mockReturnValue(new QueryRunner(new Manager())),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadVideo: jest.fn().mockResolvedValue(() => {
              return Promise.resolve();
            }),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateVideoCommandHandler);
    eventBus = module.get(EventBus);
    s3Service = module.get(S3Service);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should publish event', async () => {
    await handler.execute(
      new CreateVideoCommand(
        'displayName',
        'email',
        'title',
        'mimetype',
        'extension',
        Buffer.from('')
      )
    );

    expect(s3Service.uploadVideo).toHaveBeenCalled();
    expect(eventBus.publish).toBeCalledTimes(1);
  });
});
