export default () => ({
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? 'nikola',
    database: process.env.DB_NAME ?? 'expense_tracker',
  },
  jwt: {
    secret: process.env.JWT_SECRET
  },
  email: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
  },
});
