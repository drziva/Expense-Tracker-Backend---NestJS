import { GetExpensesQueryDto } from "src/expenses/dto/get-expenses-query.dto";
import { GetIncomesQueryDto } from "src/incomes/dto/get-incomes-query.dto";
import { logoImageBASE64 } from "./image";

export function renderTransactionTableTemplate(
  transactions: any[],
  type: string,
  filters?: GetIncomesQueryDto | GetExpensesQueryDto,
  groupNames?: Record<number, string>
): string {

  const money = (n: number) =>
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(n)) + " €";

  const prettyDate = (d: string | Date) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const label = (k: string) =>
    k.charAt(0).toUpperCase() + k.slice(1);

  const title =
    type === "income"
      ? "Income Transactions"
      : "Expense Transactions";

  const amountClass = type === "income" ? "income" : "expense";

  const total = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const filtersHtml = filters
    ? Object.entries(filters)
        .filter(([key, v]) => key !== "page" && key !== "limit" && v !== undefined && v !== null && v !== "")
        .map(
          ([key, value]) => {
            if (key === "from" || key === "to") {
              value = prettyDate(value as string);
            }

            if(key === "sort"){
              key = "Sort by"
              switch (value) {
                case "amount_asc":
                  value = "Amount (Low to High)";
                  break;
                case "amount_desc":
                  value = "Amount (High to Low)";
                  break;
                case "date_asc":
                  value = "Date (Oldest First)";
                  break;
                case "date_desc":
                  value = "Date (Newest First)";
                  break;
              }
            }

            if(key === "group_id"){
              key = "Group"
              value = groupNames?.[Number(value)] || value;
            }

            return `
              <div class="meta-pill">
                <span class="meta-label">${label(key)}:</span>
                <span class="meta-value">${value}</span>
              </div>`
            }
        )
        .join("")
    : "";

  return `
<html>
<head>
<style>

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial;
    padding: 40px;
    background: #f4f6f8;
    color: #1f2937;
  }

  h1 {
    font-size: 30px;
    font-weight: 700;
    margin: 0 0 6px 0;
  }

  .subtitle {
    font-size: 13px;
    color: #6b7280;
  }

  .header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:30px;
  }

  .brand {
    display:flex;
    align-items:center;
    gap:18px;
  }

  .logo {
    height:64px;
  }

  .report-meta {
    font-size:12px;
    color:#6b7280;
    text-align:right;
  }

  .total-hero {
    background:white;
    border-left:4px solid rgba(12,216,199,0.55);
    padding:18px 24px;
    border-radius:10px;
    margin-bottom:22px;
    box-shadow:0 6px 18px rgba(0,0,0,0.05);
    display:flex;
    justify-content:space-between;
    align-items:center;
  }

  .total-title {
    font-size:12px;
    color:#6b7280;
    text-transform:uppercase;
    letter-spacing:0.08em;
  }

  .total-value {
    font-size:26px;
    font-weight:700;
    color: rgb(0, 0, 0);
  }

  .meta-grid {
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    margin-bottom:26px;
  }

  .meta-pill {
    background: rgba(12,216,199,0.06);
    border-radius:20px;
    padding:6px 12px;
    font-size:12px;
  }

  .meta-label {
    font-weight:600;
    margin-right:4px;
  }

  table {
    width:100%;
    border-collapse:collapse;
    background:white;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 4px 14px rgba(0,0,0,0.05);
  }

  thead {
    background: rgba(12,216,199,0.08);
    color:#0f4f4b;
  }

  th {
    padding:14px;
    text-align:left;
    font-size:13px;
    font-weight:600;
    letter-spacing:0.03em;
  }

  td {
    padding:14px;
    font-size:14px;
    border-bottom:1px solid #f3f4f6;
  }

  tr:nth-child(even) td {
    background:#fafafa;
  }

  tr:last-child td {
    border-bottom:none;
  }

  .income {
    color:#059669;
    font-weight:600;
  }

  .expense {
    color:#dc2626;
    font-weight:600;
  }

</style>
</head>

<body>

  <div class="header">
    <div class="brand">
      <img class="logo" src="data:image/png;base64,${logoImageBASE64}" />
      <div>
        <h1>${title}</h1>
        <div class="subtitle">Financial transaction report</div>
      </div>
    </div>

    <div class="report-meta">
      Generated on<br/>
      <strong>${prettyDate(new Date())}</strong>
    </div>
  </div>

  <div class="total-hero">
      <div class="total-title">Total</div>
      <div class="total-value">${money(total)}</div>
  </div>

  ${
    filtersHtml
      ? `<div class="meta-grid">${filtersHtml}</div>`
      : ""
  }

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount</th>
        <th>Date</th>
        <th>Group</th>
      </tr>
    </thead>

    <tbody>
      ${transactions
        .map(
          (t) => `
        <tr>
          <td>${t.description || "-"}</td>

          <td class="${amountClass}">
            ${money(t.amount)}
          </td>

          <td>${prettyDate(t.createdAt)}</td>

          <td>${t.groupName ?? t.groupId ?? "-"}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

</body>
</html>
`;
}