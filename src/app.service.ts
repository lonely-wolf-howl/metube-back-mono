import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  sayPong(): string {
    return 'pong';
  }
}
