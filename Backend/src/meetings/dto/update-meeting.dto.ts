import { IsString, IsDateString, IsArray, IsInt, IsOptional } from 'class-validator';

export class UpdateMeetingDto {
  @IsOptional()
  @IsDateString()
  data_reuniao?: string;

  @IsOptional()
  @IsString()
  horario_reuniao?: string;

  @IsOptional()
  @IsString()
  assunto_reuniao?: string;

  @IsOptional()
  @IsString()
  tipo_reuniao?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  participants?: number[];
}
