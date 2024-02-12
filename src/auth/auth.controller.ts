import { Controller, Get, Req, Res, UseGuards, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  @Get('signin')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Res() res: Response) {
    res.redirect(process.env.FRONTEND_URL);
  }

  @Get('status')
  showStatus(@Req() req: Request) {
    console.log(req.user);
    if (req.user) {
      return { status: true };
    } else {
      return { status: false };
    }
  }

  @Get('test')
  getUserSession(
    @Headers('displayName') displayName: string,
    @Headers('email') email: string
  ) {
    console.log(displayName);
    console.log(email);

    return { message: 'The Server got user session successfully.' };
  }
}
