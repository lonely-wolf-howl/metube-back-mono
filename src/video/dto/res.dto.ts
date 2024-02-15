import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  title: string;

  @ApiProperty({ required: true })
  username: string;
}

export class FindVideoResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  title: string;

  @ApiProperty({ required: true })
  source: string;

  @ApiProperty({ required: true })
  displayName: string;

  @ApiProperty({ required: true })
  viewCount: number;
}
