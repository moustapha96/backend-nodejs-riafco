const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    const permission = [
      "GERER_ACTIVITES",
      "GERER_RESSOURCES",
      "GERER_UTILISATEURS",
      "GERER_BUREAUX",
      "GERER_ACTUALITES",
      "GERER_PARTENARIATS",
      "GERER_EVENEMENTS",
      "GERER_NEWSLETTERS",
      "GERER_ESPACE_APROPOS",
    ];
    for (const name of permission) {
      await prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
