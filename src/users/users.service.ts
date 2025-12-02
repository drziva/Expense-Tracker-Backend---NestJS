import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async existsByUsernameOrEmail(username: string, email: string): Promise<boolean> {
    const count = await this.userRepo.count({
      where: [{ username }, { email }],
    });
    return count > 0;
  }

  async findAll() {
    return this.userRepo.find();
  }

  async createUser(username: string, password: string, email: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepo.create({ 
      username, 
      password: hashedPassword, 
      email 
    });

    return this.userRepo.save(user);
  }
}
