import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./config/env.config";
import { composeDbUrl } from "./lib/db-url";

const databaseUrl = composeDbUrl({
  dbProtocol: env.DB_PROTOCOL,
  dbHost: env.DB_HOST,
  dbPort: env.DB_PORT,
  dbDatabase: env.DB_DATABASE,
  dbUsername: env.DB_USERNAME,
  dbPassword: env.DB_PASSWORD,
});

console.log(databaseUrl);

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
