const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();


async function main() {
  // Supprimer les données existantes pour éviter les doublons
  await prisma.event.deleteMany({});

  // Créer les événements
  await prisma.event.createMany({
    data: [
      {
        title: "Sommet Mondial des Villes",
        description: "Le prochain Congrès mondial des Villes se tiendra à Singapour sur le thème « Villes vivables et durables : adopter l’avenir par l’innovation et la collaboration ».",
        description_en: "The next World Cities Summit will be held in Singapore under the theme: « Liveable & Sustainable Cities: Embracing the Future through Innovation & Collaboration ».",
        startDate: new Date("2018-07-08"),
        endDate: new Date("2018-07-12"),
        location: "Singapour",
        image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
        status: "PUBLISHED",
        registrationLink: "http://www.worldcitiessummit.com.sg/",
        authorId: "cmf0z37i70009iyx4kbuakf4h", // Remplacez par un ID d'utilisateur valide dans votre base de données
      },
      {
        title: "GSEF Bilbao 2018",
        description: "La 4ème édition du Global Social Economy Forum se tiendra à Bilbao (Espagne) sur le thème : « Économie sociale et villes : valeurs et compétitivité pour un développement local inclusif et durable ».",
        description_en: "The 4th edition of the Global Social Economy Forum will be held in Bilbao (Spain) under the theme: « Social Economy and Cities: Values and Competitiveness for an Inclusive and Sustainable Local Development ».",
        startDate: new Date("2018-10-01"),
        endDate: new Date("2018-10-03"),
        location: "Bilbao, Espagne",
        image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
        status: "PUBLISHED",
        registrationLink: "https://www.gsef2018.org/fr/",
        authorId: "cmf0z37i70009iyx4kbuakf4h", // Remplacez par un ID d'utilisateur valide dans votre base de données
      },
    ],
  });

  console.log("Seed pour Event terminé avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
