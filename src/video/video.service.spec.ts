import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('VideoService', () => {
  let service: VideoService;
  let repository: Repository<Video>;

  const videoId = '3c947f7c-b67a-4890-bd7c-e84a712492d0';
  const video = new Video();
  video.id = videoId;

  const mockVideos: Video[] = [
    {
      id: videoId,
      downloadCount: 0,
      title: 'title',
      displayName: 'displayName',
      email: 'email1',
      mimetype: 'mimetype',
      viewCount: 0,
      createdAt: new Date('2024-02-20T00:00:00.000Z'),
      updatedAt: new Date('2024-02-20T00:00:00.000Z'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: getRepositoryToken(Video),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    repository = module.get<Repository<Video>>(getRepositoryToken(Video));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a video when given a valid id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(video);

      const result = await service.findOneById(videoId);

      expect(result).toEqual(video);
    });

    it('should throw NotFoundException when given an invalid id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneById('invalid id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('increaseViewCount', () => {
    it('should increase the viewCount of the video by 1', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await service.increaseViewCount(videoId);

      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('increaseDownloadCount', () => {
    it('should increase the downloadCount of the video by 1', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await service.increaseDownloadCount(videoId);

      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('findTop5Download', () => {
    it('should return top 5 videos by downloadCount in descending order', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(mockVideos);

      const result = await service.findTop5Download();

      expect(result).toEqual([
        {
          id: videoId,
          downloadCount: 0,
          title: 'title',
          displayName: 'displayName',
          email: 'email1',
          mimetype: 'mimetype',
          viewCount: 0,
          createdAt: new Date('2024-02-20T00:00:00.000Z'),
          updatedAt: new Date('2024-02-20T00:00:00.000Z'),
        },
      ]);
    });
  });
});
