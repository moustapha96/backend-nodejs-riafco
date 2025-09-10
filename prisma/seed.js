const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...")

  // Clean existing data
  await prisma.comment.deleteMany()
  await prisma.discussion.deleteMany()
  await prisma.theme.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.resourceCategory.deleteMany()
  await prisma.news.deleteMany()
  await prisma.event.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.critereMemberCountry.deleteMany()
  await prisma.memberCountry.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.historyItem.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  await prisma.newsletterCampaign.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.socialNetwork.deleteMany()
  await prisma.socialFeed.deleteMany()
  await prisma.legalMention.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.governanceReport.deleteMany()
  await prisma.siteSettings.deleteMany()
  await prisma.user.deleteMany()
  await prisma.permission.deleteMany()

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: "GERER_ACTIVITES",
        description: "Gérer les activités",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_RESSOURCES",
        description: "Gérer les ressources",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_UTILISATEURS",
        description: "Gérer les utilisateurs",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_BUREAUX",
        description: "Gérer les bureaux",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_ACTUALITES",
        description: "Gérer les actualités",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_PARTENARIATS",
        description: "Gérer les partenariats",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_EVENEMENTS",
        description: "Gérer les événements",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_NEWSLETTERS",
        description: "Gérer les newsletters",
      },
    }),
    prisma.permission.create({
      data: {
        name: "GERER_ESPACE_APROPOS",
        description: "Gérer l'espace à propos",
      },
    }),
  ])


  console.log("\n👥 Creating users...");
    const adminPassword = await bcrypt.hash("password", 12);
    const moderatorPassword = await bcrypt.hash("password", 12);
    const memberPassword = await bcrypt.hash("password", 12);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@riafco.org" },
      update: {},
      create: {
        email: "admin@riafco.org",
        password: adminPassword,
        firstName: "Admin",
        lastName: "RIAFCO",
        role: "ADMIN",
        status: "ACTIVE",
        phone: "+33123456789",
        permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
      },
    });

    const moderatorUser = await prisma.user.upsert({
      where: { email: "moderator@riafco.org" },
      update: {},
      create: {
        email: "moderator@riafco.org",
        password: moderatorPassword,
        firstName: "Modérateur",
        lastName: "RIAFCO",
        role: "MODERATOR",
        status: "ACTIVE",
        phone: "+33123456789",
        permissions: {
          connect: permissions.map((p) => ({ id: p.id })),
        },
      },
    });

    const memberUser = await prisma.user.upsert({
      where: { email: "member@riafco.org" },
      update: {},
      create: {
        email: "member@riafco.org",
        password: memberPassword,
        firstName: "Membre",
        lastName: "Test",
        role: "MEMBER",
        status: "ACTIVE",
        phone: "+33123456789",
        permissions: {
        connect: [permissions[0], permissions[1], permissions[4], permissions[6]].map((p) => ({ id: p.id })),
      },
      },
    });

    // Création de 5 membres supplémentaires
    for (let i = 1; i <= 5; i++) {
      await prisma.user.create({
        data: {
          email: `member${i}@riafco.org`,
          password: await bcrypt.hash(`Member${i}123!`, 12),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: "MEMBER",
          status: "ACTIVE",
           permissions: {
        connect: [permissions[0], permissions[1], permissions[4], permissions[6]].map((p) => ({ id: p.id })),
      },
        },
      });
    }




  // Create resource categories
  const resourceCategories = await Promise.all([
    prisma.resourceCategory.create({
      data: {
        name: "Documents juridiques",
        description: "Documents et textes juridiques",
      },
    }),
    prisma.resourceCategory.create({
      data: {
        name: "Formations",
        description: "Matériel de formation et supports pédagogiques",
      },
    }),
    prisma.resourceCategory.create({
      data: {
        name: "Rapports",
        description: "Rapports d'activité et études",
      },
    }),
  ])

  // Create activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        title: "Formation en droit des affaires",
        description: "Formation complète sur le droit des affaires internationales",
        icon: "book",
        status: "PUBLISHED",
        authorId: adminUser.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: "Conférence sur l'éthique juridique",
        description: "Conférence internationale sur l'éthique dans la profession juridique",
        icon: "users",
        status: "PUBLISHED",
        authorId: moderatorUser.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: "Atelier de médiation",
        description: "Atelier pratique sur les techniques de médiation",
        icon: "handshake",
        status: "DRAFT",
        authorId: adminUser.id,
      },
    }),
  ])

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "Assemblée Générale RIAFCO 2024",
        description: "Assemblée générale annuelle de la RIAFCO avec présentation des activités et élections",
        startDate: new Date("2024-06-15T09:00:00Z"),
        endDate: new Date("2024-06-15T17:00:00Z"),
        location: "Paris, France",
        maxAttendees: 200,
        isVirtual: false,
        status: "PUBLISHED",
        registrationLink: "https://riafco.org/register/ag2024",
        authorId: adminUser.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Webinaire: Droit numérique",
        description: "Webinaire sur les enjeux du droit numérique et de la protection des données",
        startDate: new Date("2024-07-20T14:00:00Z"),
        endDate: new Date("2024-07-20T16:00:00Z"),
        isVirtual: true,
        status: "PUBLISHED",
        registrationLink: "https://riafco.org/webinar/droit-numerique",
        authorId: moderatorUser.id,
      },
    }),
  ])

  // Create news
  const news = await Promise.all([
    prisma.news.create({
      data: {
        title: "Nouveau partenariat avec l'Université de Droit",
        content:
          "La RIAFCO annonce un nouveau partenariat stratégique avec l'Université de Droit de Paris pour développer des programmes de formation continue...",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: adminUser.id,
      },
    }),
    prisma.news.create({
      data: {
        title: "Lancement du programme de mentorat",
        content:
          "Nous sommes fiers d'annoncer le lancement de notre nouveau programme de mentorat destiné aux jeunes juristes...",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: moderatorUser.id,
      },
    }),
  ])

    // Create newsletter campaign
  const newsletterCampaign = await prisma.newsletterCampaign.create({
    data: {
      newsId: news[0].id,
      subject: "Newsletter RIAFCO - Mars 2024",
      content: "Découvrez les dernières actualités de la RIAFCO...",
      htmlContent: "<h1>Newsletter RIAFCO</h1><p>Découvrez les dernières actualités...</p>",
      status: "SENT",
      sentAt: new Date(),
      recipientCount: 150,
      openCount: 120,
      clickCount: 45,
    },
  })
    const newsletterCampaign2 = await prisma.newsletterCampaign.create({
    data: {
      newsId: news[1].id,
      subject: "Newsletter RIAFCO - Avril 2024",
      content: "Découvrez les dernières actualités de la RIAFCO...",
      htmlContent: "<h1>Newsletter RIAFCO</h1><p>Découvrez les dernières actualités...</p>",
      status: "SENT",
      sentAt: new Date(),
      recipientCount: 150,
      openCount: 120,
      clickCount: 45,
    },
  })
  // Create resources
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        title: "Guide du droit des contrats",
        description: "Guide complet sur le droit des contrats internationaux",
        fileName: "guide-droit-contrats.pdf",
        filePath: " /uploads/resources/guide-droit-contrats.pdf",
        fileType: "application/pdf",
        fileSize: 2048000,
        categoryId: resourceCategories[0].id,
        tags: ["contrats", "droit international", "guide"],
        authorId: adminUser.id,
        isPublic: true,
      },
    }),
    prisma.resource.create({
      data: {
        title: "Présentation formation éthique",
        description: "Support de présentation pour la formation sur l'éthique juridique",
        fileName: "formation-ethique.pptx",
        filePath: " /uploads/resources/formation-ethique.pptx",
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        fileSize: 5120000,
        categoryId: resourceCategories[1].id,
        tags: ["éthique", "formation", "présentation"],
        authorId: moderatorUser.id,
        isPublic: true,
      },
    }),
  ])

  // // Create member countries with criteria
  // const criteriaData = [
  //   { name: "Adhésion active", description: "Participation active aux activités de la RIAFCO" },
  //   { name: "Cotisation à jour", description: "Paiement régulier des cotisations annuelles" },
  //   { name: "Représentation locale", description: "Présence d'un bureau local ou représentant" },
  //   { name: "Formation continue", description: "Participation aux programmes de formation" },
  // ]

  // const criteria = await Promise.all(
  //   criteriaData.map((criterion) =>
  //     prisma.critereMemberCountry.create({
  //       data: criterion,
  //     }),
  //   ),
  // )

  // const memberCountries = await Promise.all([
  //   prisma.memberCountry.create({
  //     data: {
  //       name: "France",
  //       code: "FR",
  //       flag: "🇫🇷",
  //       latitude: 46.2276,
  //       longitude: 2.2137,
  //       status: "ACTIVE",
  //       criteria: {
  //         connect: [criteria[0], criteria[1], criteria[2]].map((c) => ({ id: c.id })),
  //       },
  //     },
  //   }),
  //   prisma.memberCountry.create({
  //     data: {
  //       name: "Sénégal",
  //       code: "SN",
  //       flag: "🇸🇳",
  //       latitude: 14.4974,
  //       longitude: -14.4524,
  //       status: "ACTIVE",
  //       criteria: {
  //         connect: [criteria[0], criteria[1]].map((c) => ({ id: c.id })),
  //       },
  //     },
  //   }),
  //   prisma.memberCountry.create({
  //     data: {
  //       name: "Canada",
  //       code: "CA",
  //       flag: "🇨🇦",
  //       latitude: 56.1304,
  //       longitude: -106.3468,
  //       status: "ACTIVE",
  //       criteria: {
  //         connect: criteria.map((c) => ({ id: c.id })),
  //       },
  //     },
  //   }),
  // ])

  // Create member countries with criteria
const memberCountries = await Promise.all([
  prisma.memberCountry.create({
    data: {
      name: "France",
      code: "FR",
      flag: "🇫🇷",
      latitude: 46.2276,
      longitude: 2.2137,
      status: "ACTIVE",
      criteria: {
        create: [
          { name: "Adhésion active", description: "Participation active aux activités de la RIAFCO" },
          { name: "Cotisation à jour", description: "Paiement régulier des cotisations annuelles" },
          { name: "Représentation locale", description: "Présence d'un bureau local ou représentant" },
        ],
      },
    },
  }),

  prisma.memberCountry.create({
    data: {
      name: "Sénégal",
      code: "SN",
      flag: "🇸🇳",
      latitude: 14.4974,
      longitude: -14.4524,
      status: "ACTIVE",
      criteria: {
        create: [
          { name: "Adhésion active", description: "Participation active aux activités de la RIAFCO" },
          { name: "Cotisation à jour", description: "Paiement régulier des cotisations annuelles" },
        ],
      },
    },
  }),

  prisma.memberCountry.create({
    data: {
      name: "Canada",
      code: "CA",
      flag: "🇨🇦",
      latitude: 56.1304,
      longitude: -106.3468,
      status: "ACTIVE",
      criteria: {
        create: [
          { name: "Adhésion active", description: "Participation active aux activités de la RIAFCO" },
          { name: "Cotisation à jour", description: "Paiement régulier des cotisations annuelles" },
          { name: "Représentation locale", description: "Présence d'un bureau local ou représentant" },
          { name: "Formation continue", description: "Participation aux programmes de formation" },
        ],
      },
    },
  }),
])

  // Create partners
  const partners = await Promise.all([
    prisma.partner.create({
      data: {
        name: "Barreau de Paris",
        description: "Ordre des avocats de Paris",
        country: "France",
        address: "11 Place Dauphine, 75001 Paris",
        email: "contact@avocatparis.org",
        phone: "+33144321200",
        website: "https://www.avocatparis.org",
      },
    }),
    prisma.partner.create({
      data: {
        name: "Association des Juristes Sénégalais",
        description: "Association professionnelle des juristes du Sénégal",
        country: "Sénégal",
        address: "Dakar, Sénégal",
        email: "contact@ajs.sn",
        website: "https://www.ajs.sn",
      },
    }),
  ])

  // Create history items
  const historyItems = await Promise.all([
    prisma.historyItem.create({
      data: {
        date: new Date("1985-03-15"),
        title: "Fondation de la RIAFCO",
        description: "Création officielle du Réseau International des Avocats Francophones et Catholiques",
        // category: "FOUNDATION",
      },
    }),
    prisma.historyItem.create({
      data: {
        date: new Date("1990-06-20"),
        title: "Premier congrès international",
        description: "Organisation du premier congrès international à Paris avec 150 participants",
        // category: "MILESTONE",
      },
    }),
    prisma.historyItem.create({
      data: {
        date: new Date("2000-01-01"),
        title: "Passage au nouveau millénaire",
        description: "Adaptation de la RIAFCO aux défis du 21ème siècle",
        // category: "MILESTONE",
      },
    }),
  ])

  // Create newsletter subscribers
  const newsletterSubscribers = await Promise.all([
    prisma.newsletterSubscriber.create({
      data: {
        email: "subscriber1@example.com",
        status: "ACTIVE",
      },
    }),
    prisma.newsletterSubscriber.create({
      data: {
        email: "subscriber2@example.com",
        status: "ACTIVE",
      },
    }),
  ])



  // Create contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        name: "Pierre Dubois",
        email: "pierre.dubois@example.com",
        subject: "Demande d'adhésion",
        message: "Bonjour, je souhaiterais obtenir des informations sur les conditions d'adhésion à la RIAFCO.",
        status: "PENDING",
      },
    }),
    prisma.contact.create({
      data: {
        name: "Sophie Laurent",
        email: "sophie.laurent@example.com",
        subject: "Partenariat",
        message: "Nous aimerions explorer les possibilités de partenariat avec votre organisation.",
        status: "IN_PROGRESS",
      },
    }),
  ])

  // Create social networks
  const socialNetworks = await Promise.all([
    prisma.socialNetwork.create({
      data: {
        name: "Facebook RIAFCO",
        platform: "FACEBOOK",
        url: "https://facebook.com/riafco",
        isActive: true,
        order: 1,
      },
    }),
    prisma.socialNetwork.create({
      data: {
        name: "LinkedIn RIAFCO",
        platform: "LINKEDIN",
        url: "https://linkedin.com/company/riafco",
        isActive: true,
        order: 2,
      },
    }),
    prisma.socialNetwork.create({
      data: {
        name: "Twitter RIAFCO",
        platform: "TWITTER",
        url: "https://twitter.com/riafco",
        isActive: true,
        order: 3,
      },
    }),
  ])

  // Create social feeds
  const socialFeeds = await Promise.all([
    prisma.socialFeed.create({
      data: {
        platform: "FACEBOOK",
        postId: "fb_123456789",
        content: "Nouvelle formation en droit des affaires disponible !",
        postUrl: "https://facebook.com/riafco/posts/123456789",
        author: "RIAFCO Official",
        publishedAt: new Date(),
      },
    }),
    prisma.socialFeed.create({
      data: {
        platform: "LINKEDIN",
        postId: "li_987654321",
        content: "Rejoignez notre webinaire sur le droit numérique",
        postUrl: "https://linkedin.com/company/riafco/posts/987654321",
        author: "RIAFCO",
        publishedAt: new Date(),
      },
    }),
  ])

  // Create legal mentions
  const legalMentions = await Promise.all([
    prisma.legalMention.create({
      data: {
        type: "TERMS_OF_SERVICE",
        title: "Conditions Générales d'Utilisation",
        content:
          "Les présentes conditions générales d'utilisation régissent l'accès et l'utilisation du site web de la RIAFCO...",
        language: "fr",
        isActive: true,
        version: "1.0",
      },
    }),
    prisma.legalMention.create({
      data: {
        type: "PRIVACY_POLICY",
        title: "Politique de Confidentialité",
        content: "La RIAFCO s'engage à protéger la confidentialité de vos données personnelles...",
        language: "fr",
        isActive: true,
        version: "1.0",
      },
    }),
  ])

  // Create team members
  const teamMembers = await Promise.all([
    prisma.teamMember.create({
      data: {
        name: "Dr. Jean-Claude Martin",
        position: "Président",
        bio: "Avocat spécialisé en droit international avec plus de 25 ans d'expérience",
        order: 1,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: "Me. Marie Dubois",
        position: "Vice-Présidente",
        bio: "Experte en droit des affaires et médiation commerciale",
        order: 2,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: "Pierre Lefebvre",
        position: "Secrétaire Général",
        bio: "Juriste spécialisé en droit associatif et gouvernance",
        order: 3,
      },
    }),
  ])

  // Create governance reports
  const governanceReports = await Promise.all([
    prisma.governanceReport.create({
      data: {
        
        fileUrl: " /uploads/reports/rapport-activite-2023.pdf",
        publishedAt: new Date("2024-01-15"),
        title_fr: "Rapport d'activité 2023",
        title_en: "Activity Report 2023",
        paragraphe_fr: "Ce rapport présente les activités de la RIAFCO pour l'année 2023.",
        paragraphe_en: "This report presents the activities of RIAFCO for the year 2023.",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          connect: { id: adminUser.id },
        },
      },
    }),
    prisma.governanceReport.create({
      data: {
        fileUrl: " /uploads/reports/rapport-financier-2023.pdf",
        publishedAt: new Date("2024-02-01"),
        title_fr: "Rapport financier 2023",
        title_en: "Financial Report 2023",
        paragraphe_fr: "Ce rapport présente les résultats financiers de la RIAFCO pour l'année 2023.",
        paragraphe_en: "This report presents the financial results of RIAFCO for the year 2023.",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          connect: { id: adminUser.id },
        },
      },
    }),
  ])

  // Create site settings
  const siteSettings = await prisma.siteSettings.create({
    data: {
      siteName: "RIAFCO - Réseau International des Avocats Francophones et Catholiques",
      contactEmail: "contact@riafco.org",
      socialMedia: {
        facebook: "https://facebook.com/riafco",
        linkedin: "https://linkedin.com/company/riafco",
        twitter: "https://twitter.com/riafco",
      },
      footer: "RIAFCO © 2024 - Tous droits réservés",
    },
  })

  
  // Create audit logs
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: "CREATE",
        resource: "User",
        resourceId: memberUser.id,
        details: { message: "Création d'un nouvel utilisateur membre" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: moderatorUser.id,
        action: "UPDATE",
        resource: "News",
        resourceId: news[0].id,
        details: { message: "Modification d'un article d'actualité" },
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    }),
  ])

  console.log("✅ Seed completed successfully!")
  console.log(`Created:
  - ${permissions.length} permissions
  - 3 users (1 admin, 1 moderator, 1 member)
  - ${resourceCategories.length} resource categories
  - ${activities.length} activities
  - ${events.length} events
  - ${news.length} news articles
  - ${resources.length} resources
  - ${memberCountries.length} member countries
  - ${partners.length} partners
  - ${historyItems.length} history items
  - ${newsletterSubscribers.length} newsletter subscribers
  - 1 newsletter campaign
  - ${contacts.length} contacts
  - ${socialNetworks.length} social networks
  - ${socialFeeds.length} social feeds
  - ${legalMentions.length} legal mentions
  - ${teamMembers.length} team members
  - ${governanceReports.length} governance reports
  - 1 site settings
  - ${auditLogs.length} audit logs`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
