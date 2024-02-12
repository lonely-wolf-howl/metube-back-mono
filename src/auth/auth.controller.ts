import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GoogleAuthGuard } from './utils/guard';

@Controller('auth')
export class AuthController {
  @Get('signin')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { message: 'GOOGLE AUTH START!' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect() {
    return { message: 'GOOGLE AUTH END!' };
  }

  @Get('status')
  showStatus(@Req() request: Request) {
    if (request.user) {
      return { message: 'AUTHENTICATED!' };
    } else {
      return { message: 'NOT AUTHENTICATED!' };
    }
  }
}
