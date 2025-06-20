import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const newPrismaClient = new PrismaClient({
  adapter,
  log: ["warn", "error"]
});

const prisma = global.prisma || newPrismaClient;
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
