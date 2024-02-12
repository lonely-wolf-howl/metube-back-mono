import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserSession } from '../types/type';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(payload: UserSession) {
    console.log('AUTHSERVICE IN!');
    const user = await this.userService.findOneByEmail(payload.email);
    if (user) {
      return user;
    }
    console.log('USER DOES NOT EXIST. CREATING USER...');

    return this.userService.createOrUpdateUser(
      payload.displayName,
      payload.email
    );
  }

  async findUserById(id: string) {
    const user = await this.userService.findOneById(id);
    return user;
  }
}
