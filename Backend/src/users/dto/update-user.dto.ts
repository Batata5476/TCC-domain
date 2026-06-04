import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nome_func?: string;

  @IsEmail()
  @IsOptional()
  email_func?: string;

  @IsString()
  @IsOptional()
  foto_func?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  senha_func?: string;
}
