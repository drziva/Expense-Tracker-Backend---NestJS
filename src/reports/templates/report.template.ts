import { ReportResponse } from "../dto/reports-returns.dto";

export function renderReportTemplate(report: ReportResponse): string {
  const money = (n: number) =>
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " €";

  return `
  <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          padding: 40px;
          background: #f9fafb;
          color: #2c2c2c;
        }

        h1 {
          font-size: 28px;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .date-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 28px;
        }

        .card {
          background: #ffffff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          margin-bottom: 32px;
          border: 1px solid #e5e7eb;
        }

        .summary-item {
          font-size: 15px;
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
        }

        .summary-label {
          color: #4b5563;
        }

        .summary-value {
          font-weight: 600;
          color: #111827;
        }

        h2 {
          font-size: 20px;
          margin-bottom: 14px;
          font-weight: 600;
          color: #374151;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        td {
          padding: 12px;
          font-size: 14px;
          border-bottom: 1px solid #f3f4f6;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:nth-child(even) td {
          background: #fafafa;
        }
      </style>
    </head>

    <body>

      <h1>Financial Report</h1>
      <div class="date-subtitle">
        Generated on: ${new Date().toLocaleDateString()}
      </div>

      <div class="card">
        <div class="summary-item">
          <span class="summary-label">Total incomes:</span>
          <span class="summary-value">${money(report.totalIncomes)}</span>
        </div>

        <div class="summary-item">
          <span class="summary-label">Total expenses:</span>
          <span class="summary-value">${money(report.totalExpenses)}</span>
        </div>

        <div class="summary-item">
          <span class="summary-label">Balance:</span>
          <span class="summary-value">${money(report.balance)}</span>
        </div>
      </div>

      <h2>Incomes by Group</h2>
      <table>
        <tr><th>Group</th><th>Amount</th></tr>
        ${Object.entries(report.incomesByGroup)
          .map(
            ([group, amount]) => `
            <tr>
              <td>${group}</td>
              <td>${money(amount)}</td>
            </tr>
          `
          )
          .join("")}
      </table>

      <h2>Expenses by Group</h2>
      <table>
        <tr><th>Group</th><th>Amount</th></tr>
        ${Object.entries(report.expensesByGroup)
          .map(
            ([group, amount]) => `
            <tr>
              <td>${group}</td>
              <td>${money(amount)}</td>
            </tr>
          `
          )
          .join("")}
      </table>

    </body>
  </html>
  `;
}
