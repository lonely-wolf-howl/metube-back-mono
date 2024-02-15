import { Injectable, Logger } from '@nestjs/common';
import { VideoService } from 'src/video/video.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly videoService: VideoService,
    private readonly emailService: EmailService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEmailCron() {
    Logger.log('EMAIL TASK CALLED');
    const videos = await this.videoService.findTop5Download();
    this.emailService.send(videos);
  }
}
