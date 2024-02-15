import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class PageReqDto {
  @ApiPropertyOptional({ description: 'Page number. Default = 1' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page. Default = 8',
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  size?: number = 8;
}
