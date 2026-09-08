import { IsString, IsDateString, IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateMeetingDto {
  @IsDateString()
  data_reuniao: string;

  @IsString()
  horario_reuniao: string;

  @IsString()
  assunto_reuniao: string;

  @IsString()
  tipo_reuniao: string;

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  participants?: number[];
}
