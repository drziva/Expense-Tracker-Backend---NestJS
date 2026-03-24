import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "../config";
import path from "path/win32";

const cfg = config();

export default new DataSource({
  type: "mysql",

  host: cfg.database.host,
  port: cfg.database.port,
  username: cfg.database.username,
  password: cfg.database.password,
  database: cfg.database.database,

    entities: [path.join(__dirname, "..", "**", "*.entity.{ts,js}")],
    migrations: [path.join(__dirname, "migrations", "*.{ts,js}")],

  synchronize: false,
});