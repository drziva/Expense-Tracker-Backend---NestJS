import { Controller,Post, Body, Req } from "@nestjs/common";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesService } from "./expenses.service";
import type { Request } from "express";
import { ExpenseResponse } from "./expense.types";

@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post("add")
  async create(@Body() dto: CreateExpenseDto, @Req() req: Request): Promise<ExpenseResponse> {
    const userId = (req as any).user.sub;
    const saved = await this.expensesService.create(dto, userId);
    return {
        id: saved.id,
        amount: saved.amount,
        description: saved.description,
        createdAt: saved.created_at,
    }
  }
}
