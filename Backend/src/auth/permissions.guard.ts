import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
        
@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
			'permissions',
			[context.getHandler(), context.getClass()],
		);

		if (!requiredPermissions) {
			return true;
		}
        
		// Obtém as permissões do usuário a partir do request
		const request = context.switchToHttp().getRequest();
		if (!request.user) {
			return true;
		}

		const userPermissions: string[] = request.user?.permissions ?? [];
		const hasAllPermissions = requiredPermissions.every((permission) =>
			userPermissions.includes(permission),
		);

		if (hasAllPermissions) {
			return true;
		}

		throw new ForbiddenException('Você não possui as permissões necessárias');
	}
}
