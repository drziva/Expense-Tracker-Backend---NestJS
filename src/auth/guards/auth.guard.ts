import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../public-decorator";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private jwtService: JwtService,
      private reflector: Reflector,
      private usersService: UsersService
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
      const dbUser = await this.usersService.findById(user.sub);
      if(!dbUser){
        throw new NotFoundException('User does not exist in Database');
      }
      request.user = {
          sub: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          premium: dbUser.premium
      }
      return true;
      } catch (error) { 
          if (error?.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token expired');
        }

        if (error?.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }

        throw new UnauthorizedException('Unauthorized');
      }
    }
}
