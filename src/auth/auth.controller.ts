import { Body, Controller, Post, Get, UseGuards, NotImplementedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse, SignUpResponse } from './auth.types';
import { Request } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {};

    @Post('signup')
    async createUser(@Body() input: SignUpDto): Promise<SignUpResponse> {
        return this.authService.signUp(input);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse>{
        return this.authService.login(loginDto);
    }
    
    @UseGuards(AuthGuard)
    @Get('userinfo')
    async getUserInfo(@Request() req) {
        return req.user;
    }
}
