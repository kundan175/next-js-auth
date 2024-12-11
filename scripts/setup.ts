import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🚀 Starting database setup...");

    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check for required environment variables
    const requiredEnvVars = [
      "DATABASE_URL",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "FACEBOOK_CLIENT_ID",
      "FACEBOOK_CLIENT_SECRET",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      console.warn(
        "⚠️  Missing environment variables:",
        missingEnvVars.join(", ")
      );
      console.log(
        "📝 Please add these variables to your .env file before running the application"
      );
    }

    // Create indexes (if needed)
    await prisma.$runCommandRaw({
      createIndexes: "User",
      indexes: [
        {
          key: { email: 1 },
          name: "email_idx",
          unique: true,
        },
      ],
    });

    console.log("✅ Database indexes created successfully");

    console.log(`
🎉 Setup completed successfully!

Next steps:
1. Make sure all environment variables are set in .env
2. Run 'npm run dev' to start the development server
3. Visit http://localhost:3000 to see your application

For authentication to work properly, make sure you have:
- Set up your Google OAuth credentials
- Set up your Facebook OAuth credentials
- Set a secure NEXTAUTH_SECRET
    `);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Setup failed:", error);
  process.exit(1);
});
