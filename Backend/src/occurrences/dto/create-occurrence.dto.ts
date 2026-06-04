import { IsString, IsOptional, Length } from 'class-validator';

export class CreateOccurrenceDto {
  @IsOptional()
  @IsString()
  atestado_func?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  ocorrencias?: string;
}
