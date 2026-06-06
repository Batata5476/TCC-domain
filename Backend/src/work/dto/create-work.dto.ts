import { IsDateString, IsString, Matches } from 'class-validator';

export class CreateWorkDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  entrada: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  saida: string;

  @IsDateString()
  data_ponto: string;
}
