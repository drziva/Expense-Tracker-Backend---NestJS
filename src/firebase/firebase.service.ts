import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Repository } from 'typeorm';
import { FirebaseToken } from './firebase.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FirebaseService implements OnModuleInit {
    constructor(
        @InjectRepository(FirebaseToken)
        private readonly tokenRepo: Repository<FirebaseToken>
    ) {}

    onModuleInit() {
        if(getApps.length > 0) return;
            
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
    }

    async sendNotificationToUser(userId: number, data: Record<string, string>) {
        const tokens = await this.getUserTokens(userId);
        if(tokens.length === 0) return;

        for(const tokenEntity of tokens) {
            await this.sendToToken(tokenEntity.token, data);
        }
    }

    async sendToToken(token: string, data: Record<string, string>) {
      try {
        await getMessaging().send({
          token,
          data
        });
        console.log(`Notification sent to token: ${token} with data: ${JSON.stringify(data)}`);
      } catch(error) {
        if(error.code === "messaging/registration-token-not-registered") {
          await this.removeToken(token);
          console.log("Invalid token removed: ", token);
        }
      }
    }

    async saveToken(userId: number, token: string) {
        const existing = await this.tokenRepo.findOne({ where: {token}});
        if(existing) return existing;

        return this.tokenRepo.save({
            userId,
            token
        })
    }

    async getUserTokens(userId: number) {
        return this.tokenRepo.find({ where: {userId }});
    }

    async removeToken(token: string) {
        return this.tokenRepo.delete({  token  });
    }
}