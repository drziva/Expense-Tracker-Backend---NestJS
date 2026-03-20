import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse, LoginServiceResponse, LoginUserResponse } from './dto/login-response.dto';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<LoginServiceResponse> {
        const exists = await this.usersService.existsByUsernameOrEmail(signUpDto.username,signUpDto.email);

        if(exists){
            throw new ConflictException('User with this email or username already exists.');
        }

        const user = await this.usersService.createUser(
            signUpDto.username,
            signUpDto.password,
            signUpDto.email,
        );
        
        const payload = this.userToPayload(user);

        const accessToken = await this.jwtService.signAsync(payload, {expiresIn: "15m"});
        const refreshToken = this.generateRefreshToken();
        const hashedRefreshToken = await this.hashToken(refreshToken);

        await this.refreshTokenRepo.save(this.refreshTokenPayload(user.id, hashedRefreshToken));

        const response: LoginServiceResponse = {
            accessToken,
            refreshToken: refreshToken,
            user: this.payloadToUser(payload)
        }

        return response;
    }

    async login(loginDto: LoginDto): Promise<LoginServiceResponse>{
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);
        if(!user){
            throw new UnauthorizedException('Invalid Credentials');
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new  UnauthorizedException('Invalid Credentials');
        }
        
        const payload = this.userToPayload(user);

        const accessToken = await this.jwtService.signAsync(payload, {expiresIn: "15m"});
        
        const refreshToken= this.generateRefreshToken();
        const hashedRefreshToken = await this.hashToken(refreshToken);

        await this.refreshTokenRepo.save(this.refreshTokenPayload(user.id, hashedRefreshToken));

        const response: LoginServiceResponse = {
            accessToken,
            refreshToken: refreshToken,
            user: this.payloadToUser(payload)
        }

        return response
    }

    async logout(userId: number, refreshToken: string): Promise<void> {
        const tokens = await this.refreshTokenRepo.find({ where: { user_id: userId } });

        for (const tokenEntity of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, tokenEntity.token);
        if (isMatch) {
            await this.refreshTokenRepo.delete({ id: tokenEntity.id });
            break;
            }
        }
    }

    async refresh(refreshToken: string): Promise<LoginServiceResponse> {
        const storedTokens = await this.refreshTokenRepo.find();

        let matchedToken: RefreshToken | null = null;
        
        for(const tokenEntity of storedTokens) {
            const isMatch = await bcrypt.compare(refreshToken, tokenEntity.token)

            if(isMatch) {
                matchedToken = tokenEntity;
                break;
            }
        }

        if (!matchedToken) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (matchedToken.expires_at < new Date()) {
            throw new UnauthorizedException("Refresh Token Expired");
        }

        const user = await this.usersService.findById(matchedToken.user_id);

        if(!user) {
            throw new UnauthorizedException("User not found");
        }

        await this.refreshTokenRepo.delete({id: matchedToken.id});

        const newRefreshToken = this.generateRefreshToken();
        const hashedNewRefreshToken = await this.hashToken(newRefreshToken);

        await this.refreshTokenRepo.save(this.refreshTokenPayload(user.id, hashedNewRefreshToken));

        const payload = this.userToPayload(user);

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: "15m"
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: this.payloadToUser(payload)
        }
    }

    private generateRefreshToken(): string {
        return randomBytes(64).toString('hex');
    }

    private async hashToken(token: string): Promise<string> {
        return bcrypt.hash(token, 10);
    }

    private userToPayload(user: User) {
        return {
            sub: user.id,
            username: user.username,
            email: user.email,
            premium: user.premium,
            notifications: user.budget_cap_notifications
         }
    }

    private payloadToUser(payload) {
        return {
            id: payload.sub,
            username: payload.username,
            email: payload.email,
            premium: payload.premium,
            notifications: payload.notifications
        }
    }

    private refreshTokenPayload(userId, token) {
        return {
            user_id: userId,
            token,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
    }
}
