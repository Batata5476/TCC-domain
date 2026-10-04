import { Type } from 'class-transformer';
import { IsEmail, IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  tipo_empresa?: string;

  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsString()
  @MinLength(8)
  senha_empresa: string;
}
