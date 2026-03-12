import { PrismaClient, UserRole } from "@/generated/prisma/client";
import path from "path";

import { readTSV } from "./helper";
import { generateHash } from "@/lib/bcrypt";

export async function seedUser(prisma: PrismaClient) {
  const tsvPath = path.join(process.cwd(), "prisma", "seeders", "user.tsv");
  const tsvData = readTSV(tsvPath);
  const users = tsvData.slice(1).map((line) => {
    const [role, name, email, password] = line;
    return { role, name, email, password };
  });

  // seed users
  for (const user of users) {
    if (!user.role) continue;
    if (!(user.role in UserRole)) {
      console.warn(`    ⚠️ Invalid role: ${user.role}. Skipped`);
      continue;
    }

    const password = await generateHash(user.password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role as UserRole,
        password: password,
      },
      create: {
        name: user.name,
        email: user.email,
        password: password,
        role: user.role as UserRole,
      },
    });
    
    console.log(`  ✔ Seeded user: ${user.email} (${user.name} - ${user.role})`);
  }
}