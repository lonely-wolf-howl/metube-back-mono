import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSession } from '../types/type';
import { UnauthorizedException } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signin(@Body() userSession: UserSession) {
    if (!userSession) {
      throw new UnauthorizedException();
    }
    return await this.authService.saveOrUpdateUser(userSession);
  }
}
