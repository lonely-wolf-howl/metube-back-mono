import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserSession } from '../types/type';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(userData: UserSession) {
    console.log('AUTHSERVICE IN!');
    console.log('USER SESSION:', userData);
    const user = await this.userService.findOneByEmail(userData.email);
    console.log('USER FROM DATABASE:', user);
    if (user) {
      return user;
    }
    console.log('USER DOES NOT EXIST. CREATING USER...');

    return this.userService.createOrUpdateUser(
      userData.displayName,
      userData.email
    );
  }

  async findUser(id: string) {
    const user = await this.userService.findOneById(id);
    return user;
  }
}
