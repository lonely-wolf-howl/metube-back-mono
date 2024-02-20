import { Test, TestingModule } from '@nestjs/testing';
import { FindVideoQueryHandler } from './find-video.handler';
import { FindVideoQuery } from '../query/find-video.query';
import { Video } from '../entity/video.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { S3Service } from '../../s3/s3.service';

describe('FindVideoQueryHandler', () => {
  let handler: FindVideoQueryHandler;
  let videoRepository: Repository<Video>;
  let s3Service: S3Service;

  const videoId = '3c947f7c-b67a-4890-bd7c-e84a712492d0';
  const video = new Video();
  video.id = videoId;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindVideoQueryHandler,
        {
          provide: getRepositoryToken(Video),
          useClass: Repository,
        },
        {
          provide: S3Service,
          useValue: {
            getVideoUrl: jest.fn().mockImplementation((videoId: string) => {
              return Promise.resolve(`https://example.com/videos/${videoId}`);
            }),
          },
        },
      ],
    }).compile();

    handler = module.get<FindVideoQueryHandler>(FindVideoQueryHandler);
    videoRepository = module.get<Repository<Video>>(getRepositoryToken(Video));
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should find video with source', async () => {
    jest.spyOn(videoRepository, 'findOne').mockResolvedValueOnce(video);

    const result = await handler.execute(new FindVideoQuery(videoId));

    expect(result.id).toEqual(videoId);
    expect(s3Service.getVideoUrl).toHaveBeenCalledTimes(1);
    expect(result.source).toEqual(`https://example.com/videos/${videoId}`);
  });
});
