import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepo.find();
  }

  async createUser(username: string, password: string, email: string) {
    const user = this.userRepo.create({ username, password, email });
    return this.userRepo.save(user);
  }
}
