import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './dto/login-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<LoginResponse> {
        const exists = await this.usersService.existsByUsernameOrEmail(signUpDto.username,signUpDto.email);

        if(exists){
            throw new ConflictException('User with this email or username already exists.');
        }

        const user = await this.usersService.createUser(
            signUpDto.username,
            signUpDto.password,
            signUpDto.email,
        );
        
        const token = await this.jwtService.signAsync({
            sub: user.id,
            username: user.username,
            email: user.email,
            premium: user.premium
        });

        const response: LoginResponse = {
            accessToken: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                premium: user.premium,
                notifications: user.budget_cap_notifications
            }
        }

        return response;
    }

    async login(loginDto: LoginDto): Promise<LoginResponse>{
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);
        if(!user){
            throw new UnauthorizedException('Invalid Credentials');
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new  UnauthorizedException('Invalid Credentials');
        }
        
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            premium: user.premium,
            notifications: user.budget_cap_notifications
        }

        const token = await this.jwtService.signAsync(payload);
                
        const response: LoginResponse = {
            accessToken: token,
            user: {
                id: payload.sub,
                username: user.username,
                email: user.email,
                premium: user.premium,
                notifications: user.budget_cap_notifications
            }
        }

        return response
    }
}
