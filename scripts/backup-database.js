const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

console.log("Prisma instance:", prisma); // Log pour vérifier l'instance

async function backupDatabase() {
  console.log("💾 Creating database backup...");
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = "backups";
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Récupération des données pour chaque table
    console.log("Fetching data for all tables...");
    const backup = {
      timestamp,
      users: await prisma.user.findMany(),
      permissions: await prisma.permission.findMany(),
      invitations: await prisma.invitation.findMany(),
      themes: await prisma.theme.findMany(),
      discussions: await prisma.discussion.findMany(),
      comments: await prisma.comment.findMany(),
      commentLikes: await prisma.commentLike.findMany(),
      governanceReports: await prisma.governanceReport.findMany(),
      aboutUs: await prisma.aboutUs.findMany(),
      activities: await prisma.activity.findMany(),
      events: await prisma.event.findMany(),
      news: await prisma.news.findMany(),
      newsletterSubscribers: await prisma.newsletterSubscriber.findMany(),
      newsletterCampaigns: await prisma.newsletterCampaign.findMany(),
      resources: await prisma.resource.findMany(),
      partners: await prisma.partner.findMany(),
      historyItems: await prisma.historyItem.findMany(),
      memberCountries: await prisma.memberCountry.findMany(),
      critereMemberCountries: await prisma.critereMemberCountry.findMany(),
      siteSettings: await prisma.siteSettings.findMany(),
      pageSettings: await prisma.pageSettings.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      resourceCategories: await prisma.resourceCategory.findMany(),
      contacts: await prisma.contact.findMany(),
      socialNetworks: await prisma.socialNetwork.findMany(),
      socialFeeds: await prisma.socialFeed.findMany(),
      legalMentions: await prisma.legalMention.findMany(),
      teamMembers: await prisma.teamMember.findMany(),
    };

    // Écriture du fichier de sauvegarde
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log(`✅ Database backup created: ${backupFile}`);
    console.log(`📊 Backup contains ${Object.keys(backup).length} tables`);
  } catch (error) {
    console.error("❌ Database backup failed:", error);
    throw error;
  }
}

backupDatabase()
  .catch((e) => {
    console.error("❌ Backup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
