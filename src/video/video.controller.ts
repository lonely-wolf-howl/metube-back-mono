import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoCommand } from './command/create-video.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { HeaderGuard } from '../auth/guards/header.guard';
import { FindVideosQuery } from './query/find-videos.query';
import { S3Service } from '../s3/s3.service';
import { Response } from 'express';
import { ApiConsumes, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import {
  ApiGetItemsResponse,
  ApiGetResponse,
  ApiPostResponse,
} from 'src/common/decorators/swagger.decorator';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { CreateVideoResDto, FindVideoResDto } from './dto/res.dto';
import { PageReqDto } from 'src/common/dto/req.dto';

@ApiTags('Video')
@ApiExtraModels(
  CreateVideoReqDto,
  CreateVideoResDto,
  PageReqDto,
  FindVideoReqDto,
  FindVideoResDto
)
@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly s3Service: S3Service
  ) {}

  @ApiConsumes('multipart/form-data')
  @ApiPostResponse(CreateVideoResDto)
  @UseGuards(HeaderGuard)
  @UseInterceptors(FileInterceptor('video'))
  @Post()
  async upload(
    @Headers('displayname') displayName: string,
    @Headers('email') email: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'mp4',
        })
        .addMaxSizeValidator({
          maxSize: 100 * 1024 * 1024, // 100MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    )
    file: Express.Multer.File,
    @Body() createVideoReqDto: CreateVideoReqDto
  ): Promise<CreateVideoResDto> {
    const { title } = createVideoReqDto;
    const { mimetype, originalname, buffer } = file;
    const extension = originalname.split('.')[1];

    const command = new CreateVideoCommand(
      title,
      decodeURIComponent(displayName),
      email,
      mimetype,
      extension,
      buffer
    );
    const { id, username } = await this.commandBus.execute(command);
    return { id, title, username };
  }

  @ApiGetItemsResponse(FindVideoResDto)
  @Get()
  async findAll(
    @Query() { page, size }: PageReqDto
  ): Promise<FindVideoResDto[]> {
    const findVideosQuery = new FindVideosQuery(page, size);
    const videos = await this.queryBus.execute(findVideosQuery);
    return videos.map(({ id, source, title, displayName, viewCount }) => {
      return {
        id,
        source,
        title,
        displayName,
        viewCount,
      };
    });
  }

  @ApiGetResponse(FindVideoResDto)
  @Get(':id')
  async findOne(@Param() { id }: FindVideoReqDto): Promise<FindVideoResDto> {
    const { source, title, displayName, viewCount } =
      await this.videoService.findOne(id);
    return {
      id,
      source,
      title,
      displayName,
      viewCount,
    };
  }

  @Post(':id/view-count')
  async increaseViewCount(@Param() { id }: { id: string }) {
    return await this.videoService.increaseViewCount(id);
  }

  @Get(':id/download')
  async download(
    @Param() { id }: { id: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const { stream, mimetype, size } = await this.s3Service.downloadVideo(id);
    res.set({
      'Content-Length': size,
      'Content-Type': mimetype,
    });
    return new StreamableFile(stream);
  }

  @Post(':id/download-count')
  async increaseDownloadCount(@Param() { id }: { id: string }) {
    return await this.videoService.increaseDownloadCount(id);
  }
}
