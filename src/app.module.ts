import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpenseGroupsModule } from './expense-groups/expense-groups.module';
import { IncomesModule } from './incomes/incomes.module';
import { IncomeGroupsModule } from './income-groups/income-groups.module';
import { ReportsModule } from './reports/reports.module';
import { RemindersModule } from './reminders/reminders.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule'
import { ScheduledTransactionsModule } from './scheduled-transactions/scheduled-transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import config from './config';
import { FirebaseModule } from './firebase/firebase.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    ExpensesModule,
    ExpenseGroupsModule,
    IncomesModule,
    IncomeGroupsModule,
    ReportsModule,
    RemindersModule,
    EmailModule,
    ScheduledTransactionsModule,
    DashboardModule,
    FirebaseModule
  ],
})
export class AppModule {}
