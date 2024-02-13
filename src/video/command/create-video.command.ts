import { ICommand } from '@nestjs/cqrs';

export class CreateVideoCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly displayName: string,
    readonly email: string,
    readonly mimetype: string,
    readonly extension: string,
    readonly buffer: Buffer
  ) {}
}
