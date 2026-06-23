import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  nome_empresa: string;

  @IsString()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas 14 números' })
  cnpj_empresa: string;

  @IsEmail()
  email_empresa: string;

  @IsString()
  @IsNotEmpty()
  tipo_empresa: string;

  @IsString()
  @MinLength(6)
  senha_empresa: string;
}
