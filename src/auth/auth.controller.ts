import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './dto/login-response.dto';
import { Public } from './public-decorator';
import { ApiOperation, ApiResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}


    @Public()
    @Post('signup')
    @ApiOperation({ summary: "Register a new user" })
    @ApiCreatedResponse({
        description: "User registered successfully",
        type: LoginResponse
    })
    async createUser(
        @Body() input: SignUpDto
    ): Promise<LoginResponse> {
        return this.authService.signUp(input);
    }


    @Public()
    @Post('login')
    @ApiOperation({ summary: "User login" })
    @ApiOkResponse({
        description: "User logged in successfully",
        type: LoginResponse
    })
    @ApiResponse({ status: 401, description: "Invalid credentials" })
    async login(
        @Body() loginDto: LoginDto
    ): Promise<LoginResponse> {
        return this.authService.login(loginDto);
    }
}
