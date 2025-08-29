const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log("🔄 Resetting database...")

  try {
    // Delete all data in reverse order of dependencies
    await prisma.auditLog.deleteMany()
    await prisma.newsletterCampaign.deleteMany()
    await prisma.newsletterSubscriber.deleteMany()
    await prisma.resource.deleteMany()
    await prisma.resourceCategory.deleteMany()
    await prisma.news.deleteMany()
    await prisma.event.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.partner.deleteMany()
    await prisma.historyItem.deleteMany()
    await prisma.memberCountry.deleteMany()
    await prisma.siteSettings.deleteMany()
    await prisma.user.deleteMany()

    console.log("✅ Database reset completed successfully!")
    console.log("💡 Run 'npm run db:seed' to populate with sample data")
  } catch (error) {
    console.error("❌ Database reset failed:", error)
    throw error
  }
}

resetDatabase()
  .catch((e) => {
    console.error("❌ Reset failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
