import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledTransactionsService } from './scheduled-transactions.service';

describe('ScheduledTransactionsService', () => {
  let service: ScheduledTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledTransactionsService],
    }).compile();

    service = module.get<ScheduledTransactionsService>(ScheduledTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
