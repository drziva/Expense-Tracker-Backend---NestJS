import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ScheduledTransaction } from './scheduled-transactions.entity';
import { TransactionEnum } from './dto/scheduled-transactions.types';
import { ScheduledTransactionsService } from './scheduled-transactions.service';

@Injectable()
export class ScheduledTransactionsScheduler {
  constructor(
    @InjectRepository(ScheduledTransaction)
    private readonly scheduledTransactionsRepo: Repository<ScheduledTransaction>,
    private readonly scheduledTransactionsService: ScheduledTransactionsService,
    private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM, { timeZone: 'Europe/Belgrade' })
  async handleTransactions(): Promise<void> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const transactions = await this.scheduledTransactionsRepo.find({where:{date:Between(start, end), processed:false}});

    for (const transaction of transactions) {
        try {
            switch(transaction.type) {
                case TransactionEnum.EXPENSE:
                    await this.scheduledTransactionsService.createExpenseFromTransaction(transaction);
                    break;
                
                case TransactionEnum.INCOME:
                    await this.scheduledTransactionsService.createIncomeFromTransaction(transaction);
                    break;
            }
        } catch(error){
            this.logger.error(
            'Error processing transaction',
            error?.stack ?? error,
            );
            continue;
        }
    }
  }
}
