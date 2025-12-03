import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse, SignUpResponse } from './auth.types';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {};

    @Post('signup')
    async createUser(@Body() input: SignUpDto) : Promise<SignUpResponse> {
        return this.authService.signUp(input);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) : Promise<LoginResponse>{
        return this.authService.login(loginDto);
    }
}
