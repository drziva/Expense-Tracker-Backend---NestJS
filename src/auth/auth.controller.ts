import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './auth.types';
import { Public } from './public-decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {};


    @Public()
    @Post('signup')
    @ApiOperation({ summary: "Register a new user" })
    @ApiResponse({ status: 201, description: "User registered successfully" })
    async createUser(@Body() input: SignUpDto): Promise<LoginResponse> {
        return this.authService.signUp(input);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: "User login" })
    @ApiResponse({ status: 200, description: "User logged in successfully" })
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse>{
        return this.authService.login(loginDto);
    }
}
