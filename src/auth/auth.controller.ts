import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {};

    @Post('signup')
    async createUser(@Body() input: SignUpDto) {
        return this.authService.signUp(input);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }
}
