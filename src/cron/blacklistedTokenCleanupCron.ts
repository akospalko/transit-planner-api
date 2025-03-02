import cron from "node-cron";
import { prisma } from "../prisma/prisma";

cron.schedule("0 * * * *", async () => {
  // Runs every hour
  console.log("Running token cleanup job...");

  const currentDate: Date = new Date();

  try {
    const result = await prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lte: currentDate,
        },
      },
    });

    if (result.count === 0) {
      console.log("No expired tokens found to clean up.");
    } else {
      console.log(`Token cleanup complete. ${result.count} tokens removed.`);
    }
  } catch (error) {
    console.error("Error during token cleanup:", error);
  }
});

console.log("Token cleanup job scheduled.");
