export function renderTransactionTableTemplate(
  transactions: any[],
  type: string
): string {
  const money = (n: number) =>
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(n)) + " €"; // ABSOLUTE VALUE: no negative signs

  const title =
    type === "income"
      ? "Income Transactions"
      : "Expense Transactions";

  const amountClass = type === "income" ? "income" : "expense";

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

        .income { font-weight: 600; }
        .expense { font-weight: 600; }
      </style>
    </head>

    <body>

      <h1>${title}</h1>
      <div class="date-subtitle">
        Generated on: ${new Date().toLocaleDateString()}
      </div>

      <table>
        <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Group</th>
        </tr>

        ${transactions
          .map(
            (t) => `
            <tr>
              <td>${t.description || "-"}</td>
                <td class="${amountClass}">
                    ${money(t.amount)}   <!-- Always positive -->
                </td>
              <td>${new Date(t.createdAt).toLocaleDateString()}</td>
              <td>${t.groupName ?? t.groupId ?? "-"}</td>
            </tr>
          `
          )
          .join("")}
      </table>
    </body>
  </html>
  `;
}
