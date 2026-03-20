import { Body, Controller, Delete, Post } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { UserId } from "src/auth/user-id.decorator";

@Controller("firebase")
export class FirebaseController {
    constructor(private readonly firebaseService: FirebaseService) {}

    @Post("test")
    async sendTestNotification(
        @UserId() userId: number
    ) {
        const tokenList = await this.firebaseService.getUserTokens(userId);

        for(const tokenEntity of tokenList) {
            await this.firebaseService.sendToToken(tokenEntity.token, {
                type: "Kujaca",
                title: "Kujaca Low Elo",
                body: "Scrub"
            })
        }

        return { success: true };
    }

    @Post("register")
    async saveToken(
        @UserId() userId: number,
        @Body("token") token: string
    ) {
        return this.firebaseService.saveToken(userId, token);
    }

    @Delete("remove")
    async removeToken(
        @Body("token") token: string
    ) {
        return this.firebaseService.removeToken(token);
    }
}