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

@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

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
    @Body('title') title: string
  ) {
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

  @Get()
  async findAll(@Query() { page, size }) {
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

  @Get(':id')
  async findOne(@Param() { id }) {
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
}
