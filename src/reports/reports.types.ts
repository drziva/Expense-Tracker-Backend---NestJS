import { TransactionForReport } from "./dto/transaction-for-report.dto"

export type ReminderReport = {
  totalSpent: number,
  expenses: TransactionForReport[],
  expenseTotals: Record<string, number>,
  from: Date,
  to: Date,
  groupSummary: {
      groupName: string,
      budget: number | null,
      spent: number,
      difference: number | null,
  }[]
}