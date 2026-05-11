import { IsString, IsEmail, IsInt, Min, IsNotEmpty, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nome_func: string;

  @IsString()
  @IsNotEmpty()
  cpf_func: string;

  @IsEmail()
  email_func: string;

  @IsString()
  @MinLength(6)
  senha_func: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  fk_cod_empresa: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  fk_id_setor: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  fk_id_cargo: number;
}
