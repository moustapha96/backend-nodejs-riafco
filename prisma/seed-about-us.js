const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
  // Supprimer les données existantes pour éviter les doublons
  await prisma.aboutUs.deleteMany({});

  // Créer une entrée "Qui sommes-nous ?" / "About Us"
  await prisma.aboutUs.create({
    data: {
      title_fr: "Qui sommes-nous ?",
      title_en: "About Us",
      paragraphe_fr: `
        **Un réseau au service de l’intermédiation financière pour les collectivités territoriales**

        À l’heure où les récents accords internationaux majeurs (Nouvel Agenda Urbain, Objectifs du Développement Durable, l’Accord de Paris, Programme d’Action d’Addis-Abeba) reconnaissent le rôle de premier plan joué par les collectivités locales pour relever les défis du développement, la question de la localisation et de la diversification du financement est au cœur des préoccupations.

        La décentralisation constitue pour la plupart des pays africains un outil important pour répondre à l’augmentation exponentielle des populations et de leurs besoins, et aux défis liés à l’urbanisation, au changement climatique, au développement économique, à la sécurité ou à la migration grandissante.

        Cependant, au regard des compétences qui leur sont transférées, les collectivités locales sont confrontées à une insuffisance chronique de leurs ressources financières, caractérisée par une faible décentralisation financière, une fiscalité locale peu rentable, des marchés financiers non développés malgré un appétit des investisseurs et des partenaires privés, un manque de ressources humaines propres et compétentes, et enfin une certaine inadaptation des mécanismes et instruments de financement mis en place par les États et les bailleurs multilatéraux.

        **Les Institutions de Financement des Collectivités Locales (IFCL)**

        Les IFCL sont les outils spécifiques de financement des investissements des collectivités locales, créés dans la majorité des pays d’Afrique, dans le but de financer le développement local et d’encourager les investissements réalisés sous maîtrise d’ouvrage des gouvernements locaux et régionaux.

        S’il est possible de distinguer deux catégories d’IFCL :
        - Le **Fonds d’Investissement pour les Collectivités**, qui fait transiter en direction des collectivités des ressources provenant de différents canaux étatiques et des bailleurs de fonds.
        - L’**Institution Financière Spécialisée**, qui accorde des prêts aux collectivités.

        Ces institutions ont une position clé dans les systèmes nationaux de financement de la décentralisation et travaillent en règle générale exclusivement pour les collectivités.

        Les IFCL embrassent ainsi des missions très larges, allant de la péréquation à l’attribution de subventions, de prêts, au rehaussement de crédit (garanties des prêts locaux), au renforcement de capacités, à l’appui conseil dans le cycle de vie des projets, etc. Pourtant, pour beaucoup, le mandat et les missions donnés peinent à être entièrement mis en œuvre, notamment faute de ressources financières suffisantes, entraînant ainsi une faiblesse des effectifs (tant en nombre qu’en compétences) et des services aux bénéficiaires.

        **Reconnaissance des IFCL**

        Les IFCL sont reconnues officiellement comme des catalyseurs de financements nationaux, internationaux, publics, institutionnels et privés vers les territoires, pour un développement local durable, résilient et inclusif. Pour la première fois, un texte onusien, le **Nouvel Agenda Urbain**, acté à Quito en octobre 2016 lors de la Conférence Habitat III, appelle ainsi les acteurs du développement à renforcer ou créer les IFCL.

        À ce titre, leur permettre de déployer leur assise institutionnelle, disposer des moyens humains, techniques et d’ingénierie nécessaires et suffisants pour assurer leur mandat, diversifier leurs sources de financement, et élargir leurs gammes de services financiers et techniques apportés aux gouvernements locaux et régionaux, constituent désormais une priorité.

        **Le RIAFCO**

        C’est dans cet esprit que, dès 2014, fut créé le **RIAFCO**, réseau regroupant les Institutions de Financement des Collectivités Locales du continent africain. Le RIAFCO vise ainsi à favoriser l’échange institutionnel et technique pair-à-pair, promouvoir les pratiques inspirantes, sensibiliser à des modalités d’interventions innovantes et porter la voix de ses membres dans les processus internationaux et auprès des partenaires techniques et financiers.

        **Missions du RIAFCO**

        Cadre d’échange et de partage d’expériences entre ces institutions, le RIAFCO se donne ainsi pour objectifs de porter ces questions au plus haut niveau et de trouver, à travers une vaste entreprise de capitalisation d’expériences, d’échanges entre pairs, de formations, et d’assistance technique, des réponses appropriées pour chaque membre.

        Plus spécifiquement, les 3 missions du RIAFCO sont les suivantes :
        - Encourager les échanges entre pairs, à travers le partage d’expériences et d’informations sur le cadre dans lequel évolue chaque membre.
        - Renforcer les IFCL, à travers la mise à disposition de ressources documentaires, de formation et d’expertise technique.
        - Porter le plaidoyer en faveur des IFCL, en étant une force de proposition et de représentation aux niveaux local, national et international auprès des acteurs de la décentralisation.
      `,
      paragraphe_en: `
        **A financial intermediation network for local authorities**

        At a time when recent major international agreements (the New Urban Agenda, the Sustainable Development Goals, the Paris Agreement, the Addis Ababa Action Agenda) are recognizing the leading role played by local authorities in development challenges, the question of the location and diversification of funding is a matter of pressing concern.

        Across large parts of Africa, decentralization is an important tool for addressing the needs of a rapidly expanding population – and the challenges posed by urbanization, climate change, economic development, security, and the growing issue of migration.

        Yet local authorities are chronically under-resourced to execute the powers entrusted to them because financial decentralization is limited, local tax-levying raises meagre funds, financial markets are under-developed – even though investors and private partners are willing – and authorities lack the skilled staff they need. Moreover, many of the funding mechanisms and instruments created by governments and multilateral donors are simply not up to the task.

        **Local Governments Financing Institutions (LGFIs)**

        Most African countries have created **Local Governments Financing Institutions (LGFIs)** – special bodies set up to finance local authority investments to spur local development and encourage local and regional government-led investment programmes.

        There are two types of LGFI:
        - **Local Investment Funds**, which channel resources from government and donor sources to local authorities.
        - **Specialized Financial Institutions**, which lend money to local authorities.

        Both play a key role in national decentralization financing systems and, as a general rule, work exclusively for local authorities.

        LGFIs have an exceptionally broad remit spanning equalization, grants, loans, credit enhancement (local loan guarantees), capacity building, support and advice throughout the project life cycle, and much more besides. Yet many LGFIs find it hard to fulfil every aspect of their remit, typically because they lack sufficient resources to hire enough well-trained staff and to provide services to their beneficiaries.

        **Recognition of LGFIs**

        LGFIs are officially recognized as catalysts for national and international public, institutional, and private financing to foster sustainable, resilient, inclusive local development. In October 2016, the United Nations adopted the **New Urban Agenda** at the Habitat III Conference in Quito, Ecuador – the first time the organization had officially encouraged development partners to create or strengthen LGFIs.

        The priority now is to strengthen the institutional foundations of LGFIs, to ensure they have the human, technical, and engineering resources they need to fulfil their remit, to diversify their sources of finance, and to expand the range of financial and technical services they provide to local and regional governments.

        **RIAFCO**

        It was with this in mind that **RIAFCO**, a network of LGFIs from across Africa, was created in 2014. The network seeks to foster peer-to-peer institutional and technical exchange, to promote inspiring practice, to disseminate innovative models, and to give its members a voice in international processes and with technical and financial partners (TFPs).

        **What RIAFCO does**

        RIAFCO is a forum for LGFIs to exchange ideas and share experiences. Its purpose is to raise issues of concern to LGFIs at the very highest level and to find appropriate solutions for each member by drawing on past experience, fostering peer-to-peer exchange, and providing training and technical assistance.

        More specifically, RIAFCO has a three-pronged remit:
        - Fostering peer-to-peer exchange by encouraging members to share their experiences and information about their environment.
        - Strengthening LGFIs by providing literature, training, and technical expertise.
        - Advocating for the cause of LGFIs by lobbying and representing their interests to decentralization partners at the local, national, and international levels.
      `,
      image: "https://mistralaiblackforestprod.blob.core.windows.net/images/blackforest/008c/0608/-307/6-4f7b-974f-a9340760abf4/image.jpg?se=2025-09-09T20%3A45%3A56Z&sp=r&sv=2025-07-05&sr=b&sig=gGDT9jbsy8XSpfJyaZ8wSLuDUpGbclwnph0A6PRdV7A%3D",
      isPublished: true,
    },
  });

  console.log("Seed pour AboutUs terminé avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
