import { IsString, IsDateString, IsArray, IsInt, IsOptional, ArrayNotEmpty } from 'class-validator';

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
  @ArrayNotEmpty()
  @IsInt({ each: true })
  participants?: number[];
}
