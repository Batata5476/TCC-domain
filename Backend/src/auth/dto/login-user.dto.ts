import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas números' })
  cpf: string;

  @IsString()
  @Length(6, 20)
  senha: string;
}
