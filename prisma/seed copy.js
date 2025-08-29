
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    // 2. Création des utilisateurs
    console.log("\n👥 Creating users...");
    const adminPassword = await bcrypt.hash("Admin123!", 12);
    const moderatorPassword = await bcrypt.hash("Moderator123!", 12);
    const memberPassword = await bcrypt.hash("Member123!", 12);

    const admin = await prisma.user.upsert({
      where: { email: "admin@riafco.org" },
      update: {},
      create: {
        email: "admin@riafco.org",
        password: adminPassword,
        firstName: "Admin",
        lastName: "RIAFCO",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

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
        },
      });
    }

    console.log("✅ Users created successfully");

    // 3. Pays membres
    console.log("\n🌍 Creating member countries...");
    const countries = [
      { name: "Algérie", code: "DZ", latitude: 28.0339, longitude: 1.6596, flag: "🇩🇿" },
      { name: "Bénin", code: "BJ", latitude: 9.3077, longitude: 2.3158, flag: "🇧🇯" },
      { name: "Burkina Faso", code: "BF", latitude: 12.2383, longitude: -1.5616, flag: "🇧🇫" },
      { name: "Cameroun", code: "CM", latitude: 7.3697, longitude: 12.3547, flag: "🇨🇲" },
      { name: "Côte d'Ivoire", code: "CI", latitude: 7.54, longitude: -5.5471, flag: "🇨🇮" },
      { name: "France", code: "FR", latitude: 46.2276, longitude: 2.2137, flag: "🇫🇷" },
      { name: "Gabon", code: "GA", latitude: -0.8037, longitude: 11.6094, flag: "🇬🇦" },
      { name: "Mali", code: "ML", latitude: 17.5707, longitude: -3.9962, flag: "🇲🇱" },
      { name: "Maroc", code: "MA", latitude: 31.7917, longitude: -7.0926, flag: "🇲🇦" },
      { name: "Niger", code: "NE", latitude: 17.6078, longitude: 8.0817, flag: "🇳🇪" },
      { name: "Sénégal", code: "SN", latitude: 14.4974, longitude: -14.4524, flag: "🇸🇳" },
      { name: "Tchad", code: "TD", latitude: 15.4542, longitude: 18.7322, flag: "🇹🇩" },
      { name: "Togo", code: "TG", latitude: 8.6195, longitude: 0.8248, flag: "🇹🇬" },
      { name: "Tunisie", code: "TN", latitude: 33.8869, longitude: 9.5375, flag: "🇹🇳" },
    ];

    // for (const country of countries) {
    //   await prisma.historyItem.create({ data: { ...country, date: new Date("1985-03-15"), title: "Création de le pays", type: "CREATE" , description: ""} });
    // }
    console.log("✅ Member countries created successfully");

    // 4. Catégories de ressources
    console.log("\n📁 Creating resource categories...");
    const categories = [
      { name: "Documents Officiels", description: "Statuts, règlements, procédures officielles" },
      { name: "Formations", description: "Supports de formation et matériel pédagogique" },
      { name: "Recherches", description: "Études, rapports de recherche et analyses" },
      { name: "Guides Pratiques", description: "Guides et manuels pratiques" },
      { name: "Multimédia", description: "Vidéos, présentations et contenus multimédias" },
    ];


    
    console.log("✅ Resource categories created successfully");

    // 5. Activités
    console.log("\n📅 Creating activities...");
       console.log("✅ Resource categories created successfully")

    const activities = [
      {
        title: "Formation en Comptabilité Avancée",
        description: "Formation complète sur les techniques comptables avancées et les normes internationales IFRS.",
        status: "PUBLISHED",
        authorId: admin.id,
      },
      {
        title: "Séminaire sur l'Audit Interne",
        description: "Séminaire pratique sur les méthodologies d'audit interne et les meilleures pratiques.",
        status: "PUBLISHED",
        authorId: moderator.id,
      },
      {
        title: "Atelier Gestion Financière",
        description: "Atelier interactif sur la gestion financière des entreprises et l'analyse des risques.",
        status: "DRAFT",
        authorId: moderator.id,
      },
    ]

    for (const activity of activities) {
      await prisma.activity.create({ data: activity })
    }
    console.log("✅ Activities created successfully");

    // 6. Événements
    console.log("\n🎉 Creating events...");
    const events = [
      {
        title: "Congrès Annuel RIAFCO 2024",
        description: "Le congrès annuel rassemble tous les membres pour partager les dernières innovations en comptabilité et finance.",
        startDate: new Date("2024-06-15T09:00:00Z"),
        endDate: new Date("2024-06-17T18:00:00Z"),
        location: "Dakar, Sénégal",
        status: "PUBLISHED",
        authorId: admin.id,
      },
      {
        title: "Webinaire: Digitalisation de la Comptabilité",
        description: "Webinaire sur les outils numériques et l'intelligence artificielle dans la comptabilité moderne.",
        startDate: new Date("2024-04-20T14:00:00Z"),
        endDate: new Date("2024-04-20T16:00:00Z"),
        location: "En ligne",
        status: "PUBLISHED",
        registrationLink: "https://zoom.us/webinar/register",
        authorId: moderator.id,
      },
    ];

    for (const event of events) {
      await prisma.event.create({ data: event })
    }
    console.log("✅ Events created successfully");

    // 7. Actualités
    console.log("\n📰 Creating news articles...");
    const newsArticles = [
      {
        title: "Nouvelle Norme Comptable Internationale Adoptée",
        content: "La nouvelle norme IFRS 18 sur la présentation des états financiers a été officiellement adoptée. Cette norme révolutionnaire change la façon dont les entreprises présentent leurs performances financières...",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: admin.id,
      },
      {
        title: "RIAFCO Signe un Partenariat Stratégique",
        content: "RIAFCO annonce un nouveau partenariat avec l'Organisation Mondiale des Comptables pour renforcer la formation professionnelle en Afrique francophone...",
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        authorId: moderator.id,
      },
      {
        title: "Lancement du Programme de Certification Avancée",
        content: "RIAFCO lance son nouveau programme de certification avancée en audit et contrôle de gestion, destiné aux professionnels expérimentés...",
        status: "DRAFT",
        authorId: moderator.id,
      },
    ];

    for (const article of newsArticles) {
     
       await prisma.news.create({ data: article })
    }
    console.log("✅ News articles created successfully");

    // 8. Partenaires
    console.log("\n🤝 Creating partners...");
    const partners = [
      {
        name: "Institut Français des Experts-Comptables",
        description: "Partenaire institutionnel pour la formation et la certification des comptables.",
        country: "France",
        email: "contact@ifec.fr",
        website: "https://www.ifec.fr",
      },
      {
        name: "Ordre des Experts-Comptables du Sénégal",
        description: "Organisation professionnelle des experts-comptables sénégalais.",
        country: "Sénégal",
        email: "info@oecs.sn",
        website: "https://www.oecs.sn",
      },
      {
        name: "Association des Comptables du Maroc",
        description: "Association regroupant les professionnels comptables marocains.",
        country: "Maroc",
        email: "contact@acm.ma",
        website: "https://www.acm.ma",
      },
    ];

    for (const partner of partners) {
      await prisma.partner.create({ data: partner });
    }
    console.log("✅ Partners created successfully");

    // 9. Historique
    console.log("\n📜 Creating history items...");
    const historyItems = [
      {
        date: new Date("1985-03-15"),
        title: "Création de RIAFCO",
        description: "Fondation du Réseau International des Associations Francophones de Comptables et d'Organisations professionnelles comptables à Paris.",
      },
      {
        date: new Date("1990-09-20"),
        title: "Premier Congrès International",
        description: "Organisation du premier congrès international RIAFCO à Abidjan, Côte d'Ivoire, rassemblant plus de 200 professionnels.",
      },
      {
        date: new Date("2000-01-01"),
        title: "Passage au Nouveau Millénaire",
        description: "RIAFCO adapte ses statuts et ses missions aux défis du 21ème siècle et à la mondialisation de l'économie.",
      },
      {
        date: new Date("2010-06-10"),
        title: "Lancement de la Plateforme Numérique",
        description: "Mise en ligne de la première plateforme numérique RIAFCO pour faciliter les échanges entre membres.",
      },
      {
        date: new Date("2020-03-15"),
        title: "35ème Anniversaire",
        description: "Célébration des 35 ans de RIAFCO avec plus de 50 organisations membres dans 20 pays francophones.",
      },
    ];

    // for (const item of historyItems) {
    //   await prisma.historyItem.create({ data: { ...item, date: new Date("1985-03-15"), title: "Création de le pays", type: "CREATE" , description: ""} });
    // }
    console.log("✅ History items created successfully");

    // 10. Abonnés à la newsletter
    console.log("\n📧 Creating newsletter subscribers...");
    const subscribers = [
      "newsletter@riafco.org",
      "info@comptable-francophone.org",
      "contact@audit-afrique.com",
      "formation@expertise-comptable.fr",
      "jeandupont@example.com",
      "mariedurand@example.com",
    ];

    for (const email of subscribers) {
      await prisma.newsletterSubscriber.create({ data: { email, status: "ACTIVE" } });
    }
    console.log("✅ Newsletter subscribers created successfully");

    // 11. Paramètres du site
    console.log("\n⚙️ Creating site settings...");
       await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        siteName: "RIAFCO - Réseau International des Associations Francophones de Comptables",
        contactEmail: "contact@riafco.org",
        socialMedia: {
          facebook: "https://facebook.com/riafco",
          twitter: "https://twitter.com/riafco",
          linkedin: "https://linkedin.com/company/riafco",
          youtube: "https://youtube.com/riafco",
          instagram: "https://instagram.com/riafco",
        },
        footer:
          "© 2024 RIAFCO - Réseau International des Associations Francophones de Comptables. Tous droits réservés.",
      },
    })


    console.log("✅ Site settings created successfully");

    // 12. Thèmes de discussion
    console.log("\n💬 Creating discussion themes...");
    const themes = [
      {
        title: "Transformation Digitale",
        description: "Échanges autour de la digitalisation des pratiques comptables.",
        createdById: admin.id,
        slug: "transformation-digitale"
      },
      {
        title: "Normes IFRS",
        description: "Discussions sur l'adoption et l'application des normes IFRS.",
        createdById: moderator.id,
        slug: "normes-ifrs"
      },
      {
        title: "Gestion des Risques",
        description: "Analyse et gestion des risques financiers dans les entreprises.",
        createdById: moderator.id,
        slug: "gestion-des-risques"
      },
      {
        title: "Fiscalité Internationale",
        description: "Discussions sur les enjeux fiscaux pour les entreprises multinationales.",
        createdById: admin.id,
        slug : "fiscalite-internationale"
      },
    ];

    for (const theme of themes) {
      await prisma.theme.create({ data: theme });
    }
    console.log("✅ Discussion themes created successfully");

    // 13. Discussions
    console.log("\n🗣️ Creating discussions...");
    const discussionThemes = await prisma.theme.findMany();
    const users = await prisma.user.findMany();

    
    for (let i = 0; i < 10; i++) {
      const randomTheme = faker.helpers.arrayElement(discussionThemes);
      const randomUser = faker.helpers.arrayElement(users);

      await prisma.discussion.create({
        data: {
          content: faker.lorem.paragraphs(2),
          themeId: randomTheme.id,
          createdById: randomUser.id,
        },
      });
    }
    console.log("✅ Discussions created successfully");

    // 14. Commentaires
    console.log("\n💭 Creating comments...");
    const discussions = await prisma.discussion.findMany();

    for (const discussion of discussions) {
      // Ajouter entre 1 et 5 commentaires par discussion
      const commentCount = faker.number.int({ min: 1, max: 5 });

      for (let i = 0; i < commentCount; i++) {
        const randomUser = faker.helpers.arrayElement(users);

        await prisma.comment.create({
          data: {
            content: faker.lorem.sentences(2),
            discussionId: discussion.id,
            createdById: randomUser.id,
          },
        });
      }
    }
    console.log("✅ Comments created successfully");

    // 15. Organisations
    console.log("\n🏢 Creating organizations...");
    const organizations = [
      {
        name: "Ordre des Experts-Comptables de France",
        sector: "COMPTABILITE",
        country: "France",
        city: "Paris",
        description: "Organisation professionnelle des experts-comptables en France.",
        contactEmail: "contact@oec.fr",
        website: "https://www.oec.fr",
      },
      {
        name: "Association des Comptables du Sénégal",
        sector: "COMPTABILITE",
        country: "Sénégal",
        city: "Dakar",
        description: "Association professionnelle des comptables au Sénégal.",
        contactEmail: "contact@acs.sn",
        website: "https://www.acs.sn",
      },
      {
        name: "Institut des Comptables du Maroc",
        sector: "TECHNOLOGY",
        country: "Maroc",
        city: "Rabat",
        description: "Institut professionnel des comptables au Maroc.",
        contactEmail: "contact@icm.ma",
        website: "https://www.icm.ma",
      },
    ];

    for (const org of organizations) {
      await prisma.organization.create({ data: org });
    }
    console.log("✅ Organizations created successfully");

    for (const category of categories) {
      await prisma.resourceCategory.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      })
    }

    console.log("✅ Resource categories created successfully")
    console.log("\n📄 Creating resources...");
    const resourceCategories = await prisma.resourceCategory.findMany();

    for (let i = 0; i < 15; i++) {
      const randomCategory = faker.helpers.arrayElement(resourceCategories);
      const randomUser = faker.helpers.arrayElement(users);

      await prisma.resource.create({
        data: {
          title: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          fileName: faker.system.fileName(),
          filePath: `/resources/${faker.system.fileName()}`,
          fileType: faker.helpers.arrayElement(["PDF", "DOCX", "XLSX", "PPTX"]),
          fileSize: faker.number.int({ min: 100, max: 5000 }),
          categoryId: randomCategory.id,
          authorId: randomUser.id,
        },
      });
    }
    console.log("✅ Resources created successfully");

    // 17. Invitations
    console.log("\n📩 Creating invitations...");
    for (let i = 0; i < 5; i++) {
      const randomUser = faker.helpers.arrayElement([admin, moderator]);
      const randomOrg = faker.helpers.arrayElement(await prisma.organization.findMany());

      await prisma.invitation.create({
        data: {
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          profilePic: faker.image.avatar(),
          status: "PENDING",
          invitedById: randomUser.id,
          organizationId: randomOrg.id,
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
        },
      });
    }
    console.log("✅ Invitations created successfully");

    // 18. Flux sociaux
    console.log("\n📱 Creating social feeds...");
    const platforms = ["FACEBOOK", "TWITTER", "LINKEDIN", "INSTAGRAM"];

    for (let i = 0; i < 20; i++) {
      await prisma.socialFeed.create({
        data: {
          platform: faker.helpers.arrayElement(platforms),
          postId: faker.string.alphanumeric(10),
          content: faker.lorem.sentences(2),
          postUrl: faker.internet.url(),
          author: faker.person.fullName(),
          publishedAt: faker.date.recent(),
        },
      });
    }
    console.log("✅ Social feeds created successfully");

    // 19. Audit logs
    console.log("\n📝 Creating audit logs...");
    const actions = ["USER_CREATED", "THEME_CREATED", "DISCUSSION_CREATED", "COMMENT_CREATED"];

    for (let i = 0; i < 30; i++) {
      const randomUser = faker.helpers.arrayElement(users);
      const randomAction = faker.helpers.arrayElement(actions);

      await prisma.auditLog.create({
        data: {
          userId: randomUser.id,
          action: randomAction,
          resource: randomAction.split("_")[0].toLowerCase() + "s",
          resourceId: faker.string.uuid(),
          details: { message: faker.lorem.sentence() },
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });
    }
    console.log("✅ Audit logs created successfully");

    // 20. Calendrier d'événements
    console.log("\n📅 Creating calendar events...");
    const eventCategories = ["MEETING", "CONFERENCE", "WORKSHOP", "TRAINING", "SOCIAL"];

    for (let i = 0; i < 10; i++) {
      const randomUser = faker.helpers.arrayElement(users);

      await prisma.calendarEvent.create({
        data: {
          title: faker.lorem.words(3),
          description: faker.lorem.sentences(2),
          startDate: faker.date.future(),
          endDate: faker.date.future(),
          allDay: faker.datatype.boolean(),
          location: faker.location.city(),
          color: faker.color.rgb(),
          category: faker.helpers.arrayElement(eventCategories),
          isPublic: faker.datatype.boolean(),
          authorId: randomUser.id,
        },
      });
    }
    console.log("✅ Calendar events created successfully");

    // 21. Paramètres légaux
    console.log("\n⚖️ Creating legal mentions...");
    const legalMentions = [
      {
        type: "TERMS_OF_SERVICE",
        title: "Conditions Générales d'Utilisation",
        content: faker.lorem.paragraphs(5),
        language: "fr",
      },
      {
        type: "PRIVACY_POLICY",
        title: "Politique de Confidentialité",
        content: faker.lorem.paragraphs(5),
        language: "fr",
      },
      {
        type: "COOKIE_POLICY",
        title: "Politique des Cookies",
        content: faker.lorem.paragraphs(3),
        language: "fr",
      },
    ];

    for (const mention of legalMentions) {
    
      await prisma.legalMention.create({ data: mention });
    }
    console.log("✅ Legal mentions created successfully");

    // 22. Campagnes de newsletter
    console.log("\n📧 Creating newsletter campaigns...");
    const campaignStatuses = ["DRAFT", "SCHEDULED", "SENT", "CANCELLED"];

    for (let i = 0; i < 3; i++) {
      await prisma.newsletterCampaign.create({
        data: {
          subject: faker.lorem.words(5),
          content: faker.lorem.paragraphs(3),
          htmlContent: `<h1>${faker.lorem.words(3)}</h1><p>${faker.lorem.paragraphs(2)}</p>`,
          status: faker.helpers.arrayElement(campaignStatuses),
          scheduledAt: faker.date.future(),
          recipientCount: faker.number.int({ min: 100, max: 10000 }),
          openCount: faker.number.int({ min: 10, max: 5000 }),
          clickCount: faker.number.int({ min: 5, max: 2000 }),
        },
      });
    }
    console.log("✅ Newsletter campaigns created successfully");

    // 23. Messages de contact
    console.log("\n📩 Creating contact messages...");
    const contactStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    for (let i = 0; i < 10; i++) {
      await prisma.contact.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          subject: faker.lorem.words(3),
          message: faker.lorem.paragraphs(2),
          status: faker.helpers.arrayElement(contactStatuses),
        },
      });
    }
    console.log("✅ Contact messages created successfully");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Created accounts:");
    console.log(`👤 Admin: admin@riafco.org / Admin123!`);
    console.log(`👤 Moderator: moderator@riafco.org / Moderator123!`);
    console.log(`👤 Member: member@riafco.org / Member123!`);
    console.log(`👥 5 additional members: member1-5@riafco.org / Member1-5123!`);

    console.log("\n📊 Created sample data:");
    console.log("• 14 member countries");
    console.log("• 5 resource categories");
    console.log("• 3 activities");
    console.log("• 2 events");
    console.log("• 3 news articles");
    console.log("• 3 partners");
    console.log("• 5 history items");
    console.log("• 6 newsletter subscribers");
    console.log("• Site settings and legal mentions");
    console.log("• 4 discussion themes");
    console.log("• 10 discussions with 1-5 comments each");
    console.log("• 3 organizations");
    console.log("• 15 resources");
    console.log("• 5 invitations");
    console.log("• 20 social feeds");
    console.log("• 30 audit logs");
    console.log("• 10 calendar events");
    console.log("• 3 newsletter campaigns");
    console.log("• 10 contact messages");

  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
