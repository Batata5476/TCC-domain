export const ROLES = {
  MASTER_ADMIN: 'Administrador Master',
  ADMIN: 'Administrador',
  EMPLOYEE: 'Funcionário',
} as const;

export const ADMIN_ROLES: readonly string[] = [
  ROLES.MASTER_ADMIN,
  ROLES.ADMIN,
];

export function isAdminRole(role?: string): boolean {
  return ADMIN_ROLES.includes(role ?? '');
}