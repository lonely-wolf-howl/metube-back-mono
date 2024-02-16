import { IQuery } from '@nestjs/cqrs';

export class FindVideoQuery implements IQuery {
  constructor(readonly id: string) {}
}
