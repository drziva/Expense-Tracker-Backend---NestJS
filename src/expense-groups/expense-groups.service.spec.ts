import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseGroupsService } from './expense-groups.service';

describe('ExpenseGroupsService', () => {
  let service: ExpenseGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseGroupsService],
    }).compile();

    service = module.get<ExpenseGroupsService>(ExpenseGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
