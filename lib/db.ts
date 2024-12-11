import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export function connectDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please add your MongoDB connection string to .env");
  }

  try {
    if (process.env.NODE_ENV === "production") {
      return new PrismaClient();
    } else {
      if (!global.prisma) {
        global.prisma = new PrismaClient();
      }
      return global.prisma;
    }
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw new Error("Unable to connect to database");
  }
}

// Export a singleton instance of Prisma Client
export const prisma = connectDB();
