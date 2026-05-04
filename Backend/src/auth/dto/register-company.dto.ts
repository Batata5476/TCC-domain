import { IsString, IsNotEmpty, IsEmail, Length, Matches, IsIn } from 'class-validator';

export class RegisterCompanyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  nome: string;

  @IsString()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas números' })
  cnpj: string;

  @IsEmail()
  email: string;

  @IsIn(['LTDA', 'MEI', 'SA'])
  tipo: string;

  @IsString()
  @Length(6, 20)
  senha: string;
}
