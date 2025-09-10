const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  // Nettoyage des données existantes
  await prisma.comment.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.invitation.deleteMany();

  try {
    // 1. Création des utilisateurs
    const adminEmail = process.env.ADMIN_EMAIL || "admin2@riafco.org";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
    const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin 2";
    const adminLastName = process.env.ADMIN_LAST_NAME || "RIAFCO 2";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedAdminPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    const moderatorPassword = await bcrypt.hash("Moderator123!", 12);
    const moderator = await prisma.user.upsert({
      where: { email: "moderator@riafco.org" },
      update: {},
      create: {
        email: "moderator@riafco.org",
        password: moderatorPassword,
        firstName: "Modérateur",
        lastName: "RIAFCO",
        role: "MODERATOR",
        status: "ACTIVE",
      },
    });

    const memberPassword = await bcrypt.hash("Member123!", 12);
    const member = await prisma.user.upsert({
      where: { email: "member@riafco.org" },
      update: {},
      create: {
        email: "member@riafco.org",
        password: memberPassword,
        firstName: "Membre",
        lastName: "Test",
        role: "MEMBER",
        status: "ACTIVE",
      },
    });

    console.log("✅ Users created successfully");

    // 2. Création des thèmes
    const themes = [
      {
        title: "Normes Comptables Internationales",
        description: "Discussions sur les normes IFRS, leur application et leurs évolutions",
        slug: "normes-comptables-internationales",
        isPublic: true,
        isModerated: false,
        moderatorIds: [],
        createdById: admin.id,
        discussionCount: 2,
        lastActivityAt: new Date(),
      },
      {
        title: "Audit et Contrôle Interne",
        description: "Échanges sur les pratiques d'audit, méthodologies et outils de contrôle",
        slug: "audit-et-controle-interne",
        isPublic: true,
        isModerated: true,
        moderatorIds: [moderator.id],
        createdById: moderator.id,
        discussionCount: 1,
        lastActivityAt: new Date(),
      },
    ];

    const createdThemes = [];
    for (const theme of themes) {
      const createdTheme = await prisma.theme.create({ data: theme });
      createdThemes.push(createdTheme);
    }
    console.log("✅ Themes created successfully");

    // 3. Création des discussions
    const discussions = [
      {
        title: "IFRS 17 - Impact sur les assurances",
        content: "Quels sont les principaux défis d'implémentation de la norme IFRS 17 pour les compagnies d'assurance en Afrique ?",
        themeId: createdThemes[0].id,
        createdById: admin.id,
        isSticky: true,
        isLocked: false,
        views: 10,
        commentCount: 2,
      },
      {
        title: "Transition vers IFRS 16 - Retours d'expérience",
        content: "Partageons nos expériences sur la mise en œuvre d'IFRS 16 (contrats de location). Quelles difficultés avez-vous rencontrées ?",
        themeId: createdThemes[0].id,
        createdById: member.id,
        isSticky: false,
        isLocked: false,
        views: 5,
        commentCount: 1,
      },
      {
        title: "Outils d'audit numérique - Recommandations",
        content: "Quels sont les meilleurs outils d'audit assisté par ordinateur que vous recommandez ? Comparaison des solutions disponibles.",
        themeId: createdThemes[1].id,
        createdById: moderator.id,
        isSticky: false,
        isLocked: false,
        views: 8,
        commentCount: 1,
      },
    ];

    const createdDiscussions = [];
    for (const discussion of discussions) {
      const createdDiscussion = await prisma.discussion.create({ data: discussion });
      createdDiscussions.push(createdDiscussion);
    }
    console.log("✅ Discussions created successfully");

    // 4. Création des commentaires (corrigé pour éviter les indices invalides)
    const comments = [
      {
        content: "Excellente question ! Nous avons eu des difficultés similaires lors de notre implémentation. La formation des équipes est cruciale.",
        discussionId: createdDiscussions[0].id,
        createdById: moderator.id, // Utilisation de `createdById` au lieu de `authorId`
      },
      {
        content: "Je recommande de commencer par une analyse d'impact détaillée avant toute implémentation. Cela évite beaucoup de problèmes par la suite.",
        discussionId: createdDiscussions[0].id,
        createdById: member.id, // Utilisation de `createdById`
      },
      {
        content: "Pour IFRS 16, nous avons utilisé un logiciel spécialisé qui a grandement facilité la transition. Je peux partager les détails si cela vous intéresse.",
        discussionId: createdDiscussions[1].id,
        createdById: admin.id, // Utilisation de `createdById`
      },
      {
        content: "Très intéressant ! Pourriez-vous nous en dire plus sur les fonctionnalités qui vous ont le plus aidé ?",
        discussionId: createdDiscussions[1].id,
        createdById: moderator.id, // Utilisation de `createdById`
      },
      {
        content: "J'utilise ACL Analytics depuis plusieurs années. Très efficace pour l'analyse de données et la détection d'anomalies.",
        discussionId: createdDiscussions[2].id,
        createdById: member.id, // Utilisation de `createdById`
      },
    ];

    const createdComments = [];
    for (const comment of comments) {
      const createdComment = await prisma.comment.create({ data: comment });
      createdComments.push(createdComment);
    }
    console.log("✅ Comments created successfully");

    // 5. Création des réponses aux commentaires
    const replyComments = [
      {
        content: "Tout à fait d'accord ! La formation est souvent négligée mais c'est la clé du succès.",
        discussionId: createdDiscussions[0].id,
        createdById: admin.id,
        parentId: createdComments[0].id,
      },
      {
        content: "Merci pour cette suggestion ! Avez-vous des modèles d'analyse d'impact à partager ?",
        discussionId: createdDiscussions[0].id,
        createdById: member.id,
        parentId: createdComments[1].id,
      },
      {
        content: "Je serais très intéressé par ces détails ! Pouvez-vous nous contacter en privé ?",
        discussionId: createdDiscussions[1].id,
        createdById: moderator.id,
        parentId: createdComments[2].id,
      },
    ];

    for (const replyComment of replyComments) {
      await prisma.comment.create({ data: replyComment });
    }
    console.log("✅ Reply comments created successfully");

    // 6. Création des invitations
    const invitations = [
      {
        fullName: "Marie Dupont",
        email: "expert1@comptable.fr",
        phone: "+33123456789",
        status: "PENDING",
        token: "inv_" + Math.random().toString(36).substring(2, 15),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invitedById: admin.id,
      },
      {
        fullName: "Amadou Diallo",
        email: "auditeur@cabinet-audit.sn",
        phone: "+221771234567",
        status: "PENDING",
        token: "inv_" + Math.random().toString(36).substring(2, 15),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invitedById: moderator.id,
      },
      {
        fullName: "Fatima Benali",
        email: "formateur@formation-compta.ma",
        phone: "+212612345678",
        status: "ACCEPTED",
        token: "inv_" + Math.random().toString(36).substring(2, 15),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        invitedById: admin.id,
      },
    ];

    for (const invitation of invitations) {
      await prisma.invitation.create({ data: invitation });
    }
    console.log("✅ Invitations created successfully");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
