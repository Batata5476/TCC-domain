import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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

  @IsString()
  @MinLength(8)
  senha_empresa: string;
}
