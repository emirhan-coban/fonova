import { PrismaClient } from "@prisma/client";
import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

function prepareVercelSqliteDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!process.env.VERCEL || !databaseUrl?.startsWith("file:/tmp/")) {
    return;
  }

  const target = databaseUrl.replace("file:", "");
  const source = join(process.cwd(), "prisma", "dev.db");

  if (!existsSync(target) && existsSync(source)) {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
}

prepareVercelSqliteDatabase();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
