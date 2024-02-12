import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async findOneById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async createOrUpdateUser(displayName: string, email: string) {
    const newUser = this.userRepository.create({ displayName, email });
    return this.userRepository.save(newUser);
  }
}
