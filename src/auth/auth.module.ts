import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from './config/jwt-secret';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global:true,
      secret: JWT_SECRET,
      signOptions:{expiresIn: '1d'},
    })
  ],
  providers: [AuthService,AuthGuard],
  controllers: [AuthController],
  
})
export class AuthModule {}
