import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeGroup } from './income-groups.entity';
import { IncomeGroupsController } from './income-groups.controller';
import { IncomeGroupsService } from './income-groups.service';
import { UsersModule } from '../users/users.module';
import { Income } from '../incomes/incomes.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([IncomeGroup, Income]),
        UsersModule,
    ],
    controllers: [IncomeGroupsController],
    providers: [IncomeGroupsService],
    exports: [IncomeGroupsService],
})
export class IncomeGroupsModule {}
