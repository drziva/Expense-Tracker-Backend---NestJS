import { Injectable} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signUp(input: { username: string; password: string; email: string;}) {
        const user = await this.usersService.createUser(
            input.username,
            input.password,
            input.email
        );
        return { id: user.id, username: user.username, email: user.email };
    }
}

