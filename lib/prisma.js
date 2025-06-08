import { PrismaClient } from "../prisma/generated";

const newPrismaClient = new PrismaClient({
  log: ["warn", "error"]
});

const prisma = global.prisma || newPrismaClient;
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
