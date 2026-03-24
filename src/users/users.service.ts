import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UserId } from '../auth/user-id.decorator';
import { AuthProviders } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async existsByUsernameOrEmail(username: string, email: string): Promise<boolean> {
    const exists = await this.userRepo.exists({
      where: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    return exists;
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async createUser(username: string, password: string, email: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepo.create({ 
      username: username.toLowerCase(), 
      email: email.toLowerCase(), 
      password: hashedPassword
    });

    return this.userRepo.save(user);
  }

  async createGoogleUser(email: string, providerId: string, name: string): Promise<User> {
      const user = this.userRepo.create({ 
        username: name,
        email: email.toLowerCase(), 
        // No password for Google users
        provider: AuthProviders.Google,
        providerId
    });

    return this.userRepo.save(user);
  }

  async updateUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
  
  async toggleNotifications(userId:number) {
    const user = await this.userRepo.findOne({where:{id: userId}});
    user!.budget_cap_notifications = !user?.budget_cap_notifications;

    await this.userRepo.save(user!);
    return true;
  }

  async toggleWelcomed(userId:number) {
    const user = await this.userRepo.findOne({where: {id: userId}});
    user!.is_welcomed = true;

    await this.userRepo.save(user!);
    return true;
  }
}
