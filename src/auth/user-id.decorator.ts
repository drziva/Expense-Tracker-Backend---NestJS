import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

//decorator extracts req.user.sub, trims it, converts to number, validates NaN, returns safe numeric ID
export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const sub = req.user?.sub;
    if (!sub) throw new UnauthorizedException("Unauthorized: token contains no sub");
    const parsed = Number(sub.toString().trim());
    if (isNaN(parsed)) throw new UnauthorizedException("Unauthorized: token sub is not numeric");
    return parsed;
  }
);
