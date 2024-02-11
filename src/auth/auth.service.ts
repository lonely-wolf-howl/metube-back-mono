import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { UserSession } from '../types/type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async saveOrUpdateUser(userSession: UserSession): Promise<User> {
    let user = await this.userRepository.findOne({ email: userSession.email });

    if (!user) {
      user = new User();
      user.email = userSession.email;
    }
    user.name = userSession.name;

    return await this.userRepository.save(user);
  }
}
