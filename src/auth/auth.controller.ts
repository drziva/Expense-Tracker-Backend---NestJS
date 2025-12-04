import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './auth.types';
import { Public } from './public-decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {};

    @Public()
    @Post('signup')
    async createUser(@Body() input: SignUpDto): Promise<LoginResponse> {
        return this.authService.signUp(input);
    }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse>{
        return this.authService.login(loginDto);
    }
}
