import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { FirebaseController } from "./firebase.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FirebaseToken } from "./firebase.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([FirebaseToken])
    ],
    providers: [FirebaseService],
    controllers: [FirebaseController],
    exports: [FirebaseService]
})
export class FirebaseModule {}