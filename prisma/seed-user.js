const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // --- 2) Permissions (idempotent via upsert par 'name')
  const permissionsData = [
    { name: "GERER_ACTIVITES", description: "Gérer les activités" },
    { name: "GERER_RESSOURCES", description: "Gérer les ressources" },
    { name: "GERER_UTILISATEURS", description: "Gérer les utilisateurs" },
    { name: "GERER_BUREAUX", description: "Gérer les bureaux" },
    { name: "GERER_ACTUALITES", description: "Gérer les actualités" },
    { name: "GERER_PARTENARIATS", description: "Gérer les partenariats" },
    { name: "GERER_EVENEMENTS", description: "Gérer les événements" },
    { name: "GERER_NEWSLETTERS", description: "Gérer les newsletters" },
    { name: "GERER_ESPACE_APROPOS", description: "Gérer l'espace à propos" },
  ];

  const permissions = [];
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: p,
    });
    permissions.push(perm);
  }
  console.log(`🔐 Permissions upserted: ${permissions.length}`);

  // --- 3) Super Admin (idempotent via upsert par 'email')
  console.log("\n👥 Creating/Updating users...");
  const adminPassword = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD || "Password123!",
    12
  );

  const adminUser = await prisma.user.upsert({
    where: { email: "superadmin@riafco.org" },
    update: {
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      firstName: "Super Admin",
      lastName: "RIAFCO",
      phone: "+33123456789",
    },
    create: {
      email: "superadmin@riafco.org",
      password: adminPassword,
      firstName: "Super Admin",
      lastName: "RIAFCO",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      phone: "+33123456789",
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
    include: { permissions: true },
  });

  // S'assurer que le SUPER_ADMIN possède toutes les permissions
  await prisma.user.update({
    where: { id: adminUser.id },
    data: {
      permissions: {
        set: [],
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(
    `Created/Updated:
- SUPER_ADMIN: ${adminUser.email}
- Total permissions: ${permissions.length}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
