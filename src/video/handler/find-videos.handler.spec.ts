import { Test, TestingModule } from '@nestjs/testing';
import { FindVideosQueryHandler } from './find-videos.handler';
import { FindVideosQuery } from '../query/find-videos.query';
import { Video } from '../entity/video.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { S3Service } from '../../s3/s3.service';

describe('FindVideosQueryHandler', () => {
  let handler: FindVideosQueryHandler;
  let videoRepository: Repository<Video>;
  let s3Service: S3Service;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindVideosQueryHandler,
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

    handler = module.get(FindVideosQueryHandler);
    videoRepository = module.get(getRepositoryToken(Video));
    s3Service = module.get(S3Service);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should find videos with sources', async () => {
    const videos = [
      new Video(),
      new Video(),
      new Video(),
      new Video(),
      new Video(),
      new Video(),
      new Video(),
      new Video(),
    ];

    jest.spyOn(videoRepository, 'find').mockResolvedValueOnce(videos);

    const result = await handler.execute(new FindVideosQuery(1, 8));

    expect(result).toHaveLength(8);
    expect(s3Service.getVideoUrl).toHaveBeenCalledTimes(8);
    expect(result[0].source).toEqual(
      'https://example.com/videos/' + videos[0].id
    );
  });
});
