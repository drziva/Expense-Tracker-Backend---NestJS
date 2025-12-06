import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseGroupsController } from './expense-groups.controller';

describe('ExpenseGroupsController', () => {
  let controller: ExpenseGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseGroupsController],
    }).compile();

    controller = module.get<ExpenseGroupsController>(ExpenseGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
