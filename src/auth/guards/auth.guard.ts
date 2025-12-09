import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../public-decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private jwtService: JwtService,
      private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];   

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const token = authHeader.split(' ')[1];

    if(!token) {
      throw new UnauthorizedException();
    }

    try {
        const user = await this.jwtService.verifyAsync(token);
        request.user = {
            sub: user.sub,
            username: user.username,
            email: user.email,
            premium: user.premium
        }
        return true;
    } catch (error) {
        throw new UnauthorizedException();
    }
  }
}
