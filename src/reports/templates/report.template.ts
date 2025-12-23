import { ReportResponse } from "../dto/reports-responses.dto";
import { logoImageBASE64 } from "./image";

const LOGO_BASE64 = `data:image/png;base64,${logoImageBASE64}`;

export function renderReportTemplate(report: ReportResponse): string {
  const money = (n: number) =>
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " €";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    :root {
      --bg: #f8fafc;
      --paper: #ffffff;
      --text-primary: #1f2937;
      --text-secondary: #4b5563;
      --divider: rgba(0,0,0,0.08);
      --accent: #6516eeff;
      --radius: 12px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: Inter, system-ui, Arial, sans-serif;
      background: var(--bg);
      color: var(--text-primary);
      padding: 56px;
      line-height: 1.45;
    }

    /* ===== Header ===== */

    .header {
      display: flex;
      align-items: center;
      gap: 24px;
      padding-bottom: 20px;
      margin-bottom: 40px;
      border-bottom: 1.5px solid #6504d462;
    }

    .header img {
      height: 96px;
    }

    h1 {
      font-size: 26px;
      font-weight: 700;
      margin: 0;
    }

    .subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 6px;
    }

    /* ===== Summary ===== */

    .summary {
      background: var(--paper);
      border-radius: var(--radius);
      border-left: 4px solid var(--accent);
      border: 1px solid var(--divider);
      padding: 24px;
      margin-bottom: 40px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 15px;
    }

    .summary-row:not(:last-child) {
      border-bottom: 1px solid var(--divider);
    }

    .summary-label {
      color: var(--text-secondary);
    }

    .summary-value {
      font-weight: 700;
      color: var(--text-primary);
    }

    /* ===== Sections ===== */

    h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 40px 0 12px;
    }

    /* ===== Tables ===== */

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--paper);
      border-radius: var(--radius);
      overflow: hidden;
      border: 1px solid var(--divider);
      margin-bottom: 40px;
    }

    th {
      text-align: left;
      padding: 12px;
      font-size: 13px;
      font-weight: 600;
      background: rgba(51, 2, 136, 0.06);
      color: #1f2937;
      border-bottom: 1px solid var(--divider);
    }

    td {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid var(--divider);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .amount {
      text-align: right;
      white-space: nowrap;
    }
  </style>
</head>

<body>

  <!-- Header -->
  <div class="header">
    <img src="${LOGO_BASE64}" alt="VegaIT" />
    <div>
      <h1>Expense Tracker – Financial Report</h1>
      <div class="subtitle">
        Period: ${report.from.toLocaleDateString()} – ${report.to.toLocaleDateString()}<br/>
        Generated: ${new Date().toLocaleDateString()}
      </div>
    </div>
  </div>

  <!-- Summary -->
  <div class="summary">
    <div class="summary-row">
      <span class="summary-label">Total incomes</span>
      <span class="summary-value">${money(report.totalIncomes)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Total expenses</span>
      <span class="summary-value">${money(report.totalExpenses)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Balance</span>
      <span class="summary-value">${money(report.balance)}</span>
    </div>
  </div>

  <!-- Incomes by group -->
  <h2>Incomes by Group</h2>
  <table>
    <tr>
      <th>Group</th>
      <th class="amount">Amount</th>
    </tr>
    ${Object.entries(report.incomesByGroup)
      .map(
        ([group, amount]) => `
        <tr>
          <td>${group}</td>
          <td class="amount">${money(amount)}</td>
        </tr>
      `
      )
      .join("")}
  </table>

  <!-- Incomes list -->
  <h2>Incomes</h2>
  <table>
    <tr>
      <th>Date</th>
      <th>Description</th>
      <th>Group</th>
      <th class="amount">Amount</th>
    </tr>
    ${report.incomes
      .map(
        (income) => `
        <tr>
          <td>${new Date(income.created_at).toLocaleDateString()}</td>
          <td>${income.description || "-"}</td>
          <td>${income.group}</td>
          <td class="amount">${money(income.amount)}</td>
        </tr>
      `
      )
      .join("")}
  </table>

  <!-- Expenses by group -->
  <h2>Expenses by Group</h2>
  <table>
    <tr>
      <th>Group</th>
      <th class="amount">Amount</th>
    </tr>
    ${Object.entries(report.expensesByGroup)
      .map(
        ([group, amount]) => `
        <tr>
          <td>${group}</td>
          <td class="amount">${money(amount)}</td>
        </tr>
      `
      )
      .join("")}
  </table>

  <!-- Expenses list -->
  <h2>Expenses</h2>
  <table>
    <tr>
      <th>Date</th>
      <th>Description</th>
      <th>Group</th>
      <th class="amount">Amount</th>
    </tr>
    ${report.expenses
      .map(
        (expense) => `
        <tr>
          <td>${new Date(expense.created_at).toLocaleDateString()}</td>
          <td>${expense.description || "-"}</td>
          <td>${expense.group}</td>
          <td class="amount">${money(expense.amount)}</td>
        </tr>
      `
      )
      .join("")}
  </table>

</body>
</html>
`;
}
