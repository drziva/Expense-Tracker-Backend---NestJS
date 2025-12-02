import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signUp(input: { username: string; password: string; email: string;}) {
        const exists = await this.usersService.existsByUsernameOrEmail(input.username,input.email);

        if(exists){
            throw new ConflictException('User already exists');
        }

        const user = await this.usersService.createUser(
            input.username,
            input.password,
            input.email
        );
        return { id: user.id, username: user.username, email: user.email };
    }

    async login(input:{email: string;password:string}){
        const { email, password } = input;

        const user = await this.usersService.findByEmail(email);
        if(!user){
            throw new UnauthorizedException('Invalid Credentials');
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new  UnauthorizedException('Invalid Credentials');
        }
        
        const payload = {
                sub:user.id,
                username:user.username,
                email:user.email
        }
        
        const token = this.jwtService.sign(payload);

        return { 
            access_token:token,
            user:{
                id:user.id,
                username:user.username,
                email:user.email
            }
         };
    }
}

