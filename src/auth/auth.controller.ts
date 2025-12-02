import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {};

    @Post('signup')
    async createUser(@Body() body: { username: string; password: string; email: string }) {
        return this.authService.signUp(body);
    }

}
