import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoCommand } from './command/create-video.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { HeaderGuard } from '../auth/guards/header.guard';

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
      displayName,
      email,
      mimetype,
      extension,
      buffer
    );
    const { id, username } = await this.commandBus.execute(command);
    return { id, title, username };
  }
}
