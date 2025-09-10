const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();


async function main() {
  console.log("🌱 Seeding governance reports...");

  // Nettoyage
  await prisma.governanceReport.deleteMany();

  const governanceReports = [
    {
      title_fr: "Fonctionnement du RIAFCO",
      title_en: "How RIAFCO works",
      paragraphe_fr:
        "Le RIAFCO est une association internationale gouvernée par une Assemblée Générale réunissant l’ensemble des membres de l’organisation et par un Conseil d’Administration, instance dirigeante du RIAFCO, composé d’un Président, Vice-Président, Secrétaire Général, et d’un Trésorier.",
      paragraphe_en:
        "RIAFCO is an international network governed by a General Assembly representing all members of the organization, and by a Board of Directors comprising a president, a vice-president, a secretary-general and a treasurer.",
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
    {
      title_fr: "Présidence",
      title_en: "President",
      paragraphe_fr:
        "Le premier mandat de présidence a été accordé au Fonds Spécial d’Équipement et d’Intervention Intercommunale du Cameroun (FEICOM) pour une durée de trois ans (2015 - 2018).",
      paragraphe_en:
        "The network’s first president, appointed for a three-year term (2015-2018), is Cameroon’s Special Fund for Equipment and Inter-Municipal Intervention (FEICOM).",
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
    {
      title_fr: "Vice-présidence",
      title_en: "Vice-President",
      paragraphe_fr:
        "La vice-présidence du RIAFCO est assurée par l’Agence Nationale d’Investissement des Collectivités Territoriales du Mali (ANICT).",
      paragraphe_en:
        "The network’s vice-president is Mali’s Local Authorities National Investment Agency (ANICT).",
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
    {
      title_fr: "Secrétariat Général",
      title_en: "Secretary-General",
      paragraphe_fr:
        "La fonction de secrétaire général a été attribuée au Fonds d’Investissement des Communes du Burundi (FONIC).",
      paragraphe_en:
        "The network’s secretary-general is Burundi’s National Communal Investment Fund (FONIC).",
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
    {
      title_fr: "Trésorier",
      title_en: "Treasurer",
      paragraphe_fr:
        "Le Trésorier du RIAFCO est assuré par la Caisse de Dépôts et Consignation du Gabon (CDC).",
      paragraphe_en:
        "The network’s treasurer is Gabon’s Deposit and Consignments Fund (CDC).",
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
    {
      title_fr: "Secrétariat Permanent",
      title_en: "Permanent Secretariat",
      paragraphe_fr:
        "Établi à Yaoundé au Cameroun, le secrétariat permanent est mandaté par les membres du RIAFCO pour animer le réseau et développer ses activités. Le Secrétaire Permanent est Monsieur Augustin Nkeumleun-Fosso.",
      paragraphe_en:
        "The permanent secretariat, based in Yaoundé, Cameroon, is responsible for coordinating the network and expanding its activities on behalf of RIAFCO members. Augustin Nkeumleun-Fosso is the network’s permanent secretary.",
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
    {
      title_fr: "Membres permanents",
      title_en: "Permanent members",
      paragraphe_fr: `ANFICT (Niger), ANICT (Mali), CDC (Gabon), FDL (Madagascar), FEICOM (Cameroun), FONIC (Burundi), FPCL (Côte d’Ivoire).`,
      paragraphe_en: `ANFICT (Niger), ANICT (Mali), CDC (Gabon), FDL (Madagascar), FEICOM (Cameroon), FONIC (Burundi), FPCL (Côte d’Ivoire).`,
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
    {
      title_fr: "Membres observateurs",
      title_en: "Observers",
      paragraphe_fr:
        "ADL (Sénégal), FPDCT (Burkina Faso), CONAFIL (Bénin). Le réseau collabore également avec des institutions en Afrique du Sud, Tunisie et Maroc.",
      paragraphe_en:
        "ADL (Senegal), FPDCT (Burkina Faso), CONAFIL (Benin). The network also works with institutions in South Africa, Tunisia and Morocco.",
      fileUrl: "/uploads/statuts-riafco.pdf",
      publishedAt: new Date("2015-01-01"),
    },
  ];

  for (const report of governanceReports) {
    await prisma.governanceReport.create({ data: report });
  }

  console.log("✅ Governance reports seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
