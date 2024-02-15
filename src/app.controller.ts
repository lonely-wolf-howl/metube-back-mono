import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  sayPong(): string {
    return this.appService.sayPong();
  }

  @Get('sentry')
  throwError(): void {
    throw new Error('SENTRY - ERROR TEST');
  }
}
