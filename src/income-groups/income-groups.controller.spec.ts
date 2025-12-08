import { Test, TestingModule } from '@nestjs/testing';
import { IncomeGroupsController } from './income-groups.controller';

describe('IncomeGroupsController', () => {
  let controller: IncomeGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeGroupsController],
    }).compile();

    controller = module.get<IncomeGroupsController>(IncomeGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
