import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './dto/login-response.dto';
import { Public } from './public-decorator';
import { ApiOperation, ApiResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { UserId } from './user-id.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get("me")
    getMe(@Req() req) {
        return req.user;
    }

    @Public()
    @Post('signup')
    @ApiOperation({ summary: "Register a new user" })
    @ApiCreatedResponse({
        description: "User registered successfully",
        type: LoginResponse
    })
    async createUser(
        @Body() input: SignUpDto,
        @Res({passthrough: true}) res
    ): Promise<LoginResponse> {
        const data = await this.authService.signUp(input);

        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.cookie('accessToken', data.accessToken, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 20 * 60 * 1000,            
        })

        return {
            user: data.user
        };
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
        @Res({passthrough: true}) res,
        @Body() loginDto: LoginDto
    ): Promise<LoginResponse> {
        const data = await this.authService.login(loginDto);

        this.setTokens(res, data.accessToken, data.refreshToken);

        return {
            user: data.user
        };
    }

    @Public()
    @Post("google")
    @ApiOperation({ summary: "Login with Google" })
    @ApiOkResponse({
        description: "Logged in with Google successfully",
        type: LoginResponse
    })
    @ApiResponse({ status: 401, description: "Invalid Google ID Token" })
    async googleLogin(
        @Res({passthrough: true}) res,
        @Body('credential') token: string
    ): Promise<LoginResponse> {
        const data = await this.authService.googleLogin(token);

        this.setTokens(res, data.accessToken, data.refreshToken);

        return {
            user: data.user
        };
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: "Refresh access token" })
    @ApiOkResponse({ description: "Access token refreshed successfully" })
    async refresh(
        @Req() req,
        @Res({passthrough: true}) res
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if(!refreshToken) {
            throw new UnauthorizedException('No refresh token found');
        }

        const data = await this.authService.refresh(refreshToken);

        this.setTokens(res, data.accessToken, data.refreshToken);
        
        const response: LoginResponse = {
            user: data.user
        };

        return response;
    }

    @Post('logout')
    @ApiOperation({ summary: "User logout" })
    @ApiOkResponse({ description: "User logged out successfully" })
    async logout(
        @UserId() userId: number,
        @Req() req,
        @Res({passthrough: true}) res
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if(!refreshToken) {
            return { success: true };
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })
        
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',        
        })

        await this.authService.logout(userId, refreshToken);

        return { success: true }
    }

    private setTokens(res, accessToken, refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 20 * 60 * 1000,            
        })
    }
}
