import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
            email: user.email
        }
        return true;
    } catch (error) {
        throw new UnauthorizedException();
    }
  }
}