import { Test, TestingModule } from '@nestjs/testing';
import { IncomeGroupsService } from './income-groups.service';

describe('IncomeGroupsService', () => {
  let service: IncomeGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncomeGroupsService],
    }).compile();

    service = module.get<IncomeGroupsService>(IncomeGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
