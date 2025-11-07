// prisma/seed.js
/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function wipeAll() {
    console.log("🧹 Wiping DB in FK-safe order...");

    // 1) Child-most tables first
    await prisma.commentLike.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.theme.deleteMany();

    await prisma.invitation.deleteMany();
    await prisma.auditLog.deleteMany();

    await prisma.newsletterCampaign.deleteMany();
    await prisma.newsletterSubscriber.deleteMany();

    await prisma.resource.deleteMany();
    await prisma.resourceCategory.deleteMany();

    await prisma.news.deleteMany();
    await prisma.event.deleteMany();
    await prisma.activity.deleteMany();

    await prisma.critereMemberCountry.deleteMany();
    await prisma.memberCountry.deleteMany();

    await prisma.partner.deleteMany();
    await prisma.historyItem.deleteMany();
    await prisma.contact.deleteMany();

    await prisma.socialFeed.deleteMany();
    await prisma.socialNetwork.deleteMany();

    await prisma.legalMention.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.governanceReport.deleteMany();

    await prisma.siteSettings.deleteMany();

    await prisma.user.deleteMany();
    await prisma.permission.deleteMany();

    // Optionnels (si tu utilises ces modèles plus tard)
    // await prisma.pageSettings.deleteMany();
    // await prisma.aboutUs.deleteMany();

    console.log("🧹 Done.");
}

async function main() {
    console.log("🌱 Starting seed...");

    await wipeAll();

    // ------------------------------------------------------------------
    // Permissions
    // ------------------------------------------------------------------
    const PERM_LIST = [
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
    for (const p of PERM_LIST) {
        const created = await prisma.permission.upsert({
            where: { name: p.name },
            update: { description: p.description },
            create: p,
            select: { id: true, name: true },
        });
        permissions.push(created);
    }

    // ------------------------------------------------------------------
    // Users
    // ------------------------------------------------------------------
    console.log("\n👥 Creating users...");

    const hash = (pwd) => bcrypt.hash(pwd, 12);

    const [adminUser, moderatorUser, memberUser] = await Promise.all([
        prisma.user.upsert({
            where: { email: "admin@riafco.org" },
            update: {},
            create: {
                email: "admin@riafco.org",
                password: await hash("Admin@2025"),
                firstName: "Admin",
                lastName: "RIAFCO",
                role: "ADMIN",
                status: "ACTIVE",
                phone: "+221781234567",
                permissions: { connect: permissions.map((p) => ({ id: p.id })) },
            },
        }),
        prisma.user.upsert({
            where: { email: "moderator@riafco.org" },
            update: {},
            create: {
                email: "moderator@riafco.org",
                password: await hash("Moderator@2025"),
                firstName: "Modérateur",
                lastName: "RIAFCO",
                role: "MEMBER",
                status: "ACTIVE",
                phone: "+221771234567",
                permissions: { connect: permissions.map((p) => ({ id: p.id })) },
            },
        }),
        prisma.user.upsert({
            where: { email: "member@riafco.org" },
            update: {},
            create: {
                email: "member@riafco-oi.org",
                password: await hash("Member@2025"),
                firstName: "Membre",
                lastName: "Test",
                role: "MEMBER",
                status: "ACTIVE",
                phone: "+221761234567",
                permissions: {
                    connect: [
                            "GERER_ACTIVITES",
                            "GERER_RESSOURCES",
                            "GERER_ACTUALITES",
                            "GERER_EVENEMENTS",
                        ]
                        .map((n) => permissions.find((x) => x.name === n))
                        .filter(Boolean)
                        .map((p) => ({ id: p.id })),
                },
            },
        }),
    ]);

    // 5 membres supplémentaires
    for (let i = 1; i <= 5; i++) {
        await prisma.user.create({
            data: {
                email: `member${i}@riafco.org`,
                password: await hash(`Member${i}#2025!`),
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                role: "MEMBER",
                status: "ACTIVE",
                permissions: {
                    connect: [
                            "GERER_ACTIVITES",
                            "GERER_RESSOURCES",
                            "GERER_ACTUALITES",
                            "GERER_EVENEMENTS",
                        ]
                        .map((n) => permissions.find((x) => x.name === n))
                        .filter(Boolean)
                        .map((p) => ({ id: p.id })),
                },
            },
        });
    }

    // ------------------------------------------------------------------
    // Resource categories
    // ------------------------------------------------------------------
    const resourceCategories = await Promise.all([
        prisma.resourceCategory.create({
            data: { name: "Documents juridiques", description: "Textes et documents juridiques" },
        }),
        prisma.resourceCategory.create({
            data: { name: "Formations", description: "Supports et contenus de formation" },
        }),
        prisma.resourceCategory.create({
            data: { name: "Rapports", description: "Rapports d’activité et études" },
        }),
    ]);

    // ------------------------------------------------------------------
    // Activities
    // ------------------------------------------------------------------
    const activities = await Promise.all([
        prisma.activity.create({
            data: {
                title_fr: "Formation en droit des affaires",
                description_fr: "Formation complète sur le droit des affaires internationales",
                icon: "book",
                status: "PUBLISHED",
                authorId: adminUser.id,
            },
        }),
        prisma.activity.create({
            data: {
                title_fr: "Conférence sur l'éthique juridique",
                description_fr: "Conférence internationale sur l'éthique dans la profession juridique",
                icon: "users",
                status: "PUBLISHED",
                authorId: moderatorUser.id,
            },
        }),
        prisma.activity.create({
            data: {
                title_fr: "Atelier de médiation",
                description_fr: "Atelier pratique sur les techniques de médiation",
                icon: "handshake",
                status: "DRAFT",
                authorId: adminUser.id,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------
    const events = await Promise.all([
        prisma.event.create({
            data: {
                title: "Assemblée Générale RIAFCO 2025",
                description: "Assemblée générale annuelle de la RIAFCO avec présentation des activités et élections",
                startDate: new Date("2025-12-15T09:00:00Z"),
                endDate: new Date("2025-12-15T17:00:00Z"),
                location: "Dakar, Sénégal",
                maxAttendees: 200,
                isVirtual: false,
                status: "PUBLISHED",
                registrationLink: "https://riafco-oi.org/register/ag2025",
                authorId: adminUser.id,
            },
        }),
        prisma.event.create({
            data: {
                title: "Webinaire: Droit numérique",
                description: "Webinaire sur les enjeux du droit numérique et de la protection des données",
                startDate: new Date("2025-12-20T14:00:00Z"),
                endDate: new Date("2025-12-20T16:00:00Z"),
                isVirtual: true,
                status: "PUBLISHED",
                registrationLink: "https://riafco-oi.org/webinar/droit-numerique",
                authorId: moderatorUser.id,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // News
    // ------------------------------------------------------------------
    const news = await Promise.all([
        prisma.news.create({
            data: {
                title_fr: "Nouveau partenariat avec une université",
                content_fr: "La RIAFCO annonce un nouveau partenariat stratégique pour développer des programmes de formation continue...",
                status: "PUBLISHED",
                publishedAt: new Date(),
                authorId: adminUser.id,
            },
        }),
        prisma.news.create({
            data: {
                title_fr: "Lancement du programme de mentorat",
                content_fr: "Nous annonçons le lancement de notre nouveau programme de mentorat destiné aux jeunes juristes...",
                status: "PUBLISHED",
                publishedAt: new Date(),
                authorId: moderatorUser.id,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // Newsletter Campaigns (référencent News)
    // ------------------------------------------------------------------
    const newsletterCampaigns = await Promise.all([
        prisma.newsletterCampaign.create({
            data: {
                newsId: news[0].id,
                subject: "Newsletter RIAFCO - Décembre 2025",
                content: "Découvrez les dernières actualités de la RIAFCO...",
                htmlContent: "<h1>Newsletter RIAFCO</h1><p>Dernières actualités...</p>",
                status: "SENT",
                sentAt: new Date(),
                recipientCount: 150,
                openCount: 120,
                clickCount: 45,
            },
        }),
        prisma.newsletterCampaign.create({
            data: {
                newsId: news[1].id,
                subject: "Newsletter RIAFCO - Janvier 2026",
                content: "Les prochaines activités et événements...",
                htmlContent: "<h1>Newsletter RIAFCO</h1><p>Prochaines activités...</p>",
                status: "SENT",
                sentAt: new Date(),
                recipientCount: 140,
                openCount: 100,
                clickCount: 40,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // Resources (référencent categories & author)
    // ------------------------------------------------------------------
    const resources = await Promise.all([
        prisma.resource.create({
            data: {
                title: "Guide du droit des contrats",
                description: "Guide complet sur le droit des contrats internationaux",
                fileName: "guide-droit-contrats.pdf",
                filePath: "/uploads/resources/guide-droit-contrats.pdf",
                fileType: "application/pdf",
                fileSize: 2,
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
                filePath: "/uploads/resources/formation-ethique.pptx",
                fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSize: 5,
                categoryId: resourceCategories[1].id,
                tags: ["éthique", "formation", "présentation"],
                authorId: moderatorUser.id,
                isPublic: true,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // Member Countries (+ criteria)
    // ------------------------------------------------------------------
    const memberCountries = await Promise.all([
        prisma.memberCountry.create({
            data: {
                name_fr: "France",
                pays_fr: "France",
                flag: "🇫🇷",
                coordonnees: "46.2276, 2.2137",
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
                name_fr: "Sénégal",
                pays_fr: "Sénégal",
                flag: "🇸🇳",
                coordonnees: "14.4974, -14.4524",
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
                name_fr: "Canada",
                pays_fr: "Canada",
                flag: "🇨🇦",
                coordonnees: "56.1304, -106.3468",
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
    ]);

    // ------------------------------------------------------------------
    // Partners, History, Subscribers, Contacts
    // ------------------------------------------------------------------
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
    ]);

    const historyItems = await Promise.all([
        prisma.historyItem.create({
            data: {
                date: new Date("1985-03-15"),
                title: "Fondation de la RIAFCO",
                description: "Création officielle du réseau",
            },
        }),
        prisma.historyItem.create({
            data: {
                date: new Date("1990-06-20"),
                title: "Premier congrès international",
                description: "Organisation du premier congrès à Paris",
            },
        }),
    ]);

    const newsletterSubscribers = await Promise.all([
        prisma.newsletterSubscriber.create({
            data: { email: "subscriber1@example.com", status: "ACTIVE" },
        }),
        prisma.newsletterSubscriber.create({
            data: { email: "subscriber2@example.com", status: "ACTIVE" },
        }),
    ]);

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
    ]);

    // ------------------------------------------------------------------
    // Socials & Feeds
    // ------------------------------------------------------------------
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
    ]);

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
    ]);

    // ------------------------------------------------------------------
    // Legal mentions
    // ------------------------------------------------------------------
    const legalMentions = await Promise.all([
        prisma.legalMention.create({
            data: {
                type: "TERMS_OF_SERVICE",
                title_fr: "Conditions Générales d'Utilisation",
                content_fr: "Les présentes conditions générales d'utilisation régissent l'accès et l'utilisation du site web de la RIAFCO...",
                isActive: true,
                version: "1.0",
            },
        }),
        prisma.legalMention.create({
            data: {
                type: "PRIVACY_POLICY",
                title_fr: "Politique de Confidentialité",
                content_fr: "La RIAFCO s'engage à protéger la confidentialité de vos données personnelles...",
                isActive: true,
                version: "1.0",
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // Team & Governance reports
    // ------------------------------------------------------------------
    const teamMembers = await Promise.all([
        prisma.teamMember.create({
            data: {
                name: "Dr. Jean-Claude Martin",
                position: "Président",
                bio: "Avocat spécialisé en droit international avec 25 ans d'expérience",
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
    ]);

    const governanceReports = await Promise.all([
        prisma.governanceReport.create({
            data: {
                fileUrl: "/uploads/reports/rapport-activite-2024.pdf",
                publishedAt: new Date("2025-03-01"),
                title_fr: "Rapport d'activité 2024",
                title_en: "Activity Report 2024",
                paragraphe_fr: "Ce rapport présente les activités de la RIAFCO pour l'année 2024.",
                paragraphe_en: "This report presents the activities of RIAFCO for 2024.",
                createdById: adminUser.id,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // Site settings
    // ------------------------------------------------------------------
    const siteSettings = await prisma.siteSettings.create({
        data: {
            siteName: "RIAFCO - Réseau des Institutions Africaines de Financement des Collectivités locales",
            contactEmail: "contact@riafco-oi.org",
            socialMedia: {
                facebook: "https://facebook.com/riafco",
                linkedin: "https://linkedin.com/company/riafco",
                twitter: "https://twitter.com/riafco",
            },
            footer: "RIAFCO © 2025 - Tous droits réservés",
        },
    });

    // ------------------------------------------------------------------
    // Audit logs (référencent users/resources/news…)
    // ------------------------------------------------------------------
    const auditLogs = await Promise.all([
        prisma.auditLog.create({
            data: {
                userId: adminUser.id,
                action: "CREATE",
                resource: "User",
                resourceId: memberUser.id,
                details: { message: "Création d'un nouvel utilisateur membre" },
                ipAddress: "10.0.0.10",
                userAgent: "seed-script/1.0",
            },
        }),
        prisma.auditLog.create({
            data: {
                userId: moderatorUser.id,
                action: "UPDATE",
                resource: "News",
                resourceId: news[0].id,
                details: { message: "Modification d'un article d'actualité" },
                ipAddress: "10.0.0.11",
                userAgent: "seed-script/1.0",
            },
        }),
    ]);

    console.log("\n✅ Seed completed successfully!");
    console.log(`Created:
  - ${permissions.length} permissions
  - users: admin, moderator, member + 5 membres
  - ${resourceCategories.length} resource categories
  - ${activities.length} activities
  - ${events.length} events
  - ${news.length} news
  - ${resources.length} resources
  - ${memberCountries.length} member countries
  - ${partners.length} partners
  - ${historyItems.length} history items
  - ${newsletterSubscribers.length} newsletter subscribers
  - ${newsletterCampaigns.length} newsletter campaigns
  - ${contacts.length} contacts
  - ${socialNetworks.length} social networks
  - ${socialFeeds.length} social feeds
  - ${legalMentions.length} legal mentions
  - ${teamMembers.length} team members
  - ${governanceReports.length} governance reports
  - 1 site settings
  - ${auditLogs.length} audit logs
  `);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });