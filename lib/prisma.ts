import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import pg from "pg";
import { env } from "@/config/env.config";
import { PrismaClient } from "../generated/prisma/client";
import { composeDbUrl } from "./db-url";

dotenv.config();

// globalForPrisma is used to store the PrismaClient instance in the global scope
// to prevent multiple PrismaClient instances in development (hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const databaseUrl = composeDbUrl({
  dbProtocol: env.DB_PROTOCOL ?? "postgresql",
  dbHost: env.DB_HOST ?? "localhost",
  dbPort: Number(env.DB_PORT ?? 5432),
  dbDatabase: env.DB_DATABASE ?? "",
  dbUsername: env.DB_USERNAME ?? "",
  dbPassword: env.DB_PASSWORD ?? "",
});

const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
