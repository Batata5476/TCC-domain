export interface JwtPayload {
  sub: number;          // usuario.id
  empresa_id: number;   // empresa.id
  role: string;         // ex: 'Administrador Master', 'Funcionário'
  permissions: string[]; // ex: ['tasks.create', 'reports.view']
}
