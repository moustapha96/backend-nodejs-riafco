const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedAboutUs() {
  try {
    // Vérifier si une entrée "AboutUs" existe déjà
    const existingAboutUs = await prisma.aboutUs.findFirst();
    if (existingAboutUs) {
      console.log("Une entrée 'AboutUs' existe déjà. Suppression en cours...");
      await prisma.aboutUs.deleteMany();
    }

    // Créer une nouvelle entrée "AboutUs"
    const aboutUs = await prisma.aboutUs.create({
      data: {
        title_fr: "Qui sommes-nous ?",
        title_en: "About Us",
        paragraphe_fr: `
          <p>Nous sommes une organisation dédiée à l'innovation et à l'excellence dans notre domaine.</p>
          <p>Notre mission est de fournir des solutions durables et efficaces pour répondre aux besoins de nos clients et partenaires.</p>
          <p>Avec une équipe passionnée et expérimentée, nous travaillons chaque jour pour atteindre nos objectifs et contribuer positivement à la société.</p>
        `,
        paragraphe_en: `
          <p>We are an organization dedicated to innovation and excellence in our field.</p>
          <p>Our mission is to provide sustainable and effective solutions to meet the needs of our clients and partners.</p>
          <p>With a passionate and experienced team, we work every day to achieve our goals and contribute positively to society.</p>
        `,
        image: "/uploads/about-us/example-team.jpg", // Remplacez par une URL valide
        isPublished: true,
      },
    });

    console.log("Entrée 'AboutUs' créée avec succès :", aboutUs);
  } catch (error) {
    console.error("Erreur lors du seeding de 'AboutUs' :", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seeder
seedAboutUs();
