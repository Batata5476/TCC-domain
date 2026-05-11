export type JwtSubjectType = 'company' | 'user';

export interface JwtPayload {
  sub: number;
  type?: JwtSubjectType;
  cnpj?: string;
  cpf?: string;
}
