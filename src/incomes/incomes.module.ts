import { Module } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from './incomes.entity';
import { IncomeGroup } from 'src/income-groups/income-groups.entity';
import { UsersModule } from 'src/users/users.module';
import { IncomeGroupsModule } from 'src/income-groups/income-groups.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Income, IncomeGroup]),
        UsersModule,
        IncomeGroupsModule
    ],
    controllers: [IncomesController],
    providers: [IncomesService]
})
export class IncomesModule {}
