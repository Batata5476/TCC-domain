import { IsString, IsNotEmpty, IsNumber, Length, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  nome: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas números' })
  cpf: string;

  @IsString()
  @Length(6, 20)
  senha: string;

  @IsNumber()
  codigoEmpresa: number;
}
