import { IsString, IsDateString, IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

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
  @ArrayNotEmpty()
  @IsInt({ each: true })
  participants: number[];
}
