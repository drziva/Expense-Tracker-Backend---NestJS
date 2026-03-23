import { Injectable, UnauthorizedException } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class GoogleAuthService {
    private client: OAuth2Client;

    constructor() {
        this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async verifyIdToken(token: string) {
        const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if(!payload) {
            throw new UnauthorizedException("Invalid Google Token");
        }

        if(!payload.email_verified) {
            throw new UnauthorizedException("Email not verified");
        }

        return {
            email: payload.email,
            providerId: payload.sub,
            name: payload.name,
        }
    }
}