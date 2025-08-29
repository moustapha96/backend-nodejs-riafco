const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

async function backupDatabase() {
  console.log("💾 Creating database backup...")

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupDir = "backups"

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backup = {
      timestamp,
      users: await prisma.user.findMany(),
      memberCountries: await prisma.memberCountry.findMany(),
      activities: await prisma.activity.findMany(),
      events: await prisma.event.findMany(),
      eventRegistrations: await prisma.eventRegistration.findMany(),
      news: await prisma.news.findMany(),
      newsletterSubscribers: await prisma.newsletterSubscriber.findMany(),
      newsletterCampaigns: await prisma.newsletterCampaign.findMany(),
      resources: await prisma.resource.findMany(),
      resourceCategories: await prisma.resourceCategory.findMany(),
      partners: await prisma.partner.findMany(),
      historyItems: await prisma.historyItem.findMany(),
      posts: await prisma.post.findMany(),
      follows: await prisma.follow.findMany(),
      siteSettings: await prisma.siteSettings.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
    }

    const backupFile = path.join(backupDir, `backup-${timestamp}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))

    console.log(`✅ Database backup created: ${backupFile}`)
    console.log(`📊 Backup contains ${Object.keys(backup).length - 1} tables`)
  } catch (error) {
    console.error("❌ Database backup failed:", error)
    throw error
  }
}

backupDatabase()
  .catch((e) => {
    console.error("❌ Backup failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
