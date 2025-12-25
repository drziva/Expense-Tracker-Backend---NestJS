import { ReminderReport } from "../reports.types";
import { logoImageBASE64 } from "./image";

const LOGO_BASE64 = `data:image/png;base64,${logoImageBASE64}`;

export function renderReminderReportTemplate(report: ReminderReport): string {
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

    .negative {
      color: #dc2626;
      font-weight: 700;
    }
  </style>
</head>

<body>

  <!-- Header -->
  <div class="header">
    <img src="${LOGO_BASE64}" alt="Logo" />
    <div>
      <h1>Spending Summary Report</h1>
      <div class="subtitle">
        Period: ${new Date(report.from).toLocaleDateString()} – ${new Date(
    report.to
  ).toLocaleDateString()}<br/>
        Generated: ${new Date().toLocaleDateString()}
      </div>
    </div>
  </div>

  <!-- Summary -->
  <div class="summary">
    <div class="summary-row">
      <span class="summary-label">Total spent</span>
      <span class="summary-value">${money(report.totalSpent)}</span>
    </div>
  </div>

  <!-- Spending by group -->
  <h2>Spending by Group</h2>
  <table>
    <tr>
      <th>Group</th>
      <th class="amount">Budget</th>
      <th class="amount">Spent</th>
      <th class="amount">Balance vs Budget</th>
    </tr>

    ${report.groupSummary
      .map((g) => {
        const balance = g.difference;
        const balanceFormatted =
          balance !== null ? money(balance) : "-";
        const balanceClass =
          balance !== null && balance < 0 ? "negative" : "";

        return `
          <tr>
            <td>${g.groupName}</td>
            <td class="amount">${g.budget !== null ? money(g.budget) : "-"}</td>
            <td class="amount">${money(g.spent)}</td>
            <td class="amount ${balanceClass}">${balanceFormatted}</td>
          </tr>
        `;
      })
      .join("")}
  </table>

</body>
</html>
`;
}
