import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '../../user/entity/user.entity';
import { AuthService } from '../auth.service';

/* eslint-disable @typescript-eslint/ban-types */
@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService
  ) {
    super();
  }

  serializeUser(user: User, done: Function) {
    console.log('SERIALIZE USER!');
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    const user = await this.authService.findUserById(payload.id);
    console.log('DESERIALIZE USER!');

    return done(null, user);
  }
}
