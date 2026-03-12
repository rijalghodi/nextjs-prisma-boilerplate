import "dotenv/config";

import { PrismaClient } from '../generated/prisma/client';
import * as pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { composeDbUrl } from '@/lib/db-url';
import { env } from '@/config/env.config';
import { seedUser } from './seeders/user.seed';

const databaseUrl = composeDbUrl({
  dbProtocol: env.DB_PROTOCOL,
  dbHost: env.DB_HOST,
  dbPort: env.DB_PORT,
  dbDatabase: env.DB_DATABASE,
  dbUsername: env.DB_USERNAME,
  dbPassword: env.DB_PASSWORD,
});

const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding users...');
  await seedUser(prisma);
  console.log('✅ Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });