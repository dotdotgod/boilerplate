import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

export const SKIP_CSRF_KEY = 'skipCsrf';
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;

    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Generate and set CSRF token for all requests
    const csrfTokenFromCookie = request.cookies['csrf-token'];

    if (!csrfTokenFromCookie) {
      // Generate new CSRF token if not exists
      const newToken = this.generateCsrfToken();
      response.cookie('csrf-token', newToken, {
        httpOnly: false, // Frontend needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // For initial requests without token, skip validation
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        throw new ForbiddenException(
          'CSRF token missing. Please retry the request.',
        );
      }

      return true;
    }

    // Validate CSRF token for state-changing methods
    const csrfTokenFromHeader = request.headers['x-csrf-token'] as string;

    if (!csrfTokenFromHeader) {
      throw new ForbiddenException('CSRF token header missing');
    }

    if (csrfTokenFromCookie !== csrfTokenFromHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  private generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
