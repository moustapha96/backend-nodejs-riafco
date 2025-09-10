const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();


async function main() {
  // Supprimer les données existantes pour éviter les doublons
  await prisma.historyItem.deleteMany({});

  // Créer les entrées historiques
  await prisma.historyItem.createMany({
    data: [
      {
        date: new Date("2012-01-01"),
        title: "2012 – 2014 : Prémices du Réseau",
        description: `
          Premiers échanges entre IFCL lors de plusieurs réunions internationales (Metropolis, Africités, FMDV, CGLU) sur l’idée de fonder un réseau.
        `,
      },
      {
        date: new Date("2013-01-01"),
        title: "2013 : Création du RIAFCO",
        description: `
          La création du réseau a été votée et signée pendant le Congrès Annuel 2013 de Cités et Gouvernements Locaux Unis (CGLU) à Rabat (Maroc). Cette première réunion permet l’élaboration des principes de gouvernance du réseau et la préparation des premières adhésions.
        `,
      },
      {
        date: new Date("2014-11-06"),
        title: "2014 : Élection du Bureau",
        description: `
          L’Assemblée Générale constituante du RIAFCO se tient les 6 et 7 novembre 2014 à Yaoundé, et signe la création du réseau ainsi que l'élection de la Présidence et des membres du Bureau.
        `,
      },
      {
        date: new Date("2015-01-01"),
        title: "2015 : Accord de partenariat avec le FMDV",
        description: `
          Les échanges tenus entre le FMDV et le FEICOM lors des réunions internationales de Metropolis et du FMDV (Guangzhou en 2012, Johannesburg en 2013, Hyderabad en 2014), et de CGLU (Dakar en 2012, Rabat en 2013), et la Conférence Résolutions Afrique / Marrakech 2014, ont permis de soulever l’intérêt de travailler conjointement sur le développement et l’animation du RIAFCO.
          Un Mémorandum d’entente est signé pour 3 ans entre le RIAFCO et le FMDV (Fonds Mondial pour le Développement des Villes), afin d’accompagner la structuration du réseau, la mise en place d’un plan d’action et ses premières activités.
        `,
      },
      {
        date: new Date("2015-01-01"),
        title: "2015 : Plaidoyer international du RIAFCO",
        description: `
          La première année d’existence du RIAFCO se concentre sur la visibilité internationale du réseau. Il a ainsi été essentiel d’inscrire le RIAFCO dans le renouvellement de la réflexion sur les politiques urbaines et le financement de l’action des villes à travers la participation à des évènements majeurs comme la 3ème Conférence Financing for Development tenue en Juillet à Addis Abeba, le Sommet des Nations Unies pour l’adoption de l’Agenda 2030 de développement durable tenu en Septembre à New York, le 7ème Sommet Africités tenu à Johannesburg en Décembre.
        `,
      },
      {
        date: new Date("2015-01-01"),
        title: "2015 : Réalisation de l’étude « État des lieux de 8 IFCL africaines »",
        description: `
          Afin de mieux connaître ses membres et la plus-value que constitue une mise en réseau des Institutions de Financement des Collectivités Locales - IFCL, le FMDV entreprend une étude sur le contexte de gouvernance, le mode de fonctionnement et d’intervention d’un échantillon de 8 IFCL africaines (Benin, Burundi, Cameroun, Gabon, Madagascar, Mali, Niger, Sénégal).
          Cette étude permet le début de constitution d’une base de données sur les IFCL sur les besoins en formation et de définir les échanges et formations à prévoir afin d’enrichir et de diversifier l’offre de service aux collectivités locales. L’étude a ainsi permis de comprendre et de préparer, à partir des besoins identifiés, les activités du RIAFCO (formations, échanges d’expériences, ateliers, etc.) et d’adapter les types de réponses développées par le réseau pour ses membres.
        `,
      },
      {
        date: new Date("2016-01-01"),
        title: "2016 : Reconnaissance des IFCL dans le Nouvel Agenda Urbain",
        description: `
          Pour la première fois, un texte des Nations unies, le Nouvel Agenda Urbain, acté à Quito en Octobre 2016 lors de la Conférence Habitat III, appelle ainsi les acteurs du développement à renforcer ou créer les IFCL.
        `,
      },
      {
        date: new Date("2016-01-01"),
        title: "2016 : Lancement du programme avec FMDV & UNCDF",
        description: `
          Avec l’appui du FMDV et d’UNCDF, à travers un financement du PPIAF de la Banque Mondiale, un programme de « Promotion des Marchés Financiers Municipaux à travers le renforcement des capacités et des connaissances des Fonds de Développement Municipaux africains » est lancé pour 2 années comprenant :
          - La réalisation de 4 études spécifiques, conduites au profit de 4 membres du réseau et portant sur les conditions de pérennisation et de diversification de leurs ressources financières ;
          - La proposition de plans d’actions et de formation pour ces IFCL sur la base des recommandations issues des 4 études ;
          - La création d’une plateforme web du RIAFCO, conçue comme un centre de ressources et un espace d’échange entre les membres ;
          - Un appui transversal au RIAFCO dans son fonctionnement, sa visibilité et sa stratégie.
        `,
      },
      {
        date: new Date("2017-01-01"),
        title: "2017 : Mise en œuvre du Programme RIAFCO - FMDV – UNCDF",
        description: `
          L'année 2017 a été consacrée à la mise en œuvre des activités prévues dans le programme intitulé "Promotion des Marchés Financiers Municipaux à travers le renforcement des capacités et des connaissances des Fonds de Développement Municipaux africains", en partenariat avec le FMDV, UNCDF et sous financement du PPIAF de la Banque mondiale. Ainsi, 4 études approfondies ont été réalisées au profit du FEICOM (Cameroun) sur l'accès à la finance climat, de l'ANICT (Mali) sur l'accès à l'emprunt, du FDL (Madagascar) sur les mécanismes de péréquation et de l'ANFICT (Niger) sur les fonds sectoriels notamment. Aussi, cette année a consacré à l'élaboration de la plateforme web du RIAFCO ainsi qu'à un appui transversal des partenaires du programme au RIAFCO.
        `,
      },
      {
        date: new Date("2018-03-29"),
        title: "2018 : Atelier d’Échange, de Restitution & de Dialogue Stratégique du RIAFCO",
        description: `
          Pour clore le programme FMDV-UNCDF, le RIAFCO organise les 29 et 30 mars 2018 à Dakar (Sénégal) un atelier réunissant ses membres sur le thème de la pérennisation et la diversification des ressources financières.
        `,
      },
      // --- Version anglaise ---
      {
        date: new Date("2012-01-01"),
        title: "2012–2014: An idea emerges",
        description: `
          Local government financing institutions (LGFIs) hold initial talks about creating a new network at various international meetings (Metropolis, Africités, Global Fund for Cities Development (FMDV) and United Cities and Local Governments (UCLG)).
        `,
      },
      {
        date: new Date("2013-01-01"),
        title: "2013: RIAFCO is founded",
        description: `
          The resolution creating the network was passed and adopted at the UCLG Congress in Rabat, Morocco, in 2013. The network’s governance principles were drawn up at this first meeting and preparations were made for the first wave of members.
        `,
      },
      {
        date: new Date("2014-11-06"),
        title: "2014: The Board is elected",
        description: `
          RIAFCO held its inaugural General Assembly on 6-7 November 2014 in Yaoundé. The official declaration creating the network was signed and the president and members of the Board were elected.
        `,
      },
      {
        date: new Date("2015-01-01"),
        title: "2015: RIAFCO signs a partnership agreement with FMDV",
        description: `
          During talks between the FMDV and FEICOM (at the international Metropolis and FMDV meetings in Guangzhou in 2012, Johannesburg in 2013 and Hyderabad in 2014), UCLG (Dakar in 2012, Rabat in 2013), and other partners at the Resolutions of Africa Conference (Marrakesh in 2014), it became clear that there was great interest in working together to develop and coordinate the RIAFCO network.
          RIAFCO and the FMDV signed a three-year memorandum of understanding to help structure the network, draw up an action plan and run initial activities.
        `,
      },
      {
        date: new Date("2015-01-01"),
        title: "2015: RIAFCO engages in international advocacy",
        description: `
          In its first year, RIAFCO focused on raising its profile on the global stage, including attending major events to make its voice heard on future urban policymaking and financing for local government action. For example, the network was present at the Third International Conference on Financing for Development (Addis Ababa, July), the United Nations Sustainable Development Summit (New York, September), and the seventh Africités Summit (Johannesburg, December).
        `,
      },
      {
        date: new Date("2015-01-01"),
        title: "2015: FMDV publishes a study entitled 'Overview of eight African LGFIs'",
        description: `
          The FMDV conducted a study of eight African LGFIs (Benin, Burundi, Cameroon, Gabon, Madagascar, Mali, Niger and Senegal), looking at governance, operations and intervention models, to raise the profile of its members and to showcase the benefits of an LGFI network.
          The study led to the creation of an LGFI training needs database, and a list of priority knowledge transfer and training initiatives was drawn up to expand and diversify the services on offer to local authorities. The study provided key insights that guided preparations for RIAFCO’s subsequent work (training, experience-sharing, workshops, etc.) and helped ensure that the network provided solutions tailored to its members’ needs.
        `,
      },
      {
        date: new Date("2016-01-01"),
        title: "2016: LGFIs are recognized in the New Urban Agenda",
        description: `
          In October 2016, the United Nations adopted the New Urban Agenda at the Habitat III Conference in Quito, Ecuador – the first time the organization had officially encouraged development partners to create or strengthen LGFIs.
        `,
      },
      {
        date: new Date("2016-01-01"),
        title: "2016: RIAFCO launches a programme with FMDV and UNCDF",
        description: `
          The network, in partnership with the FMDV and the United Nations Capital Development Fund (UNCDF) and with support from the World Bank’s Public-Private Infrastructure Advisory Facility (PPIAF), launched a two-year programme entitled “Promotion of Municipal Financial Markets through Capacity Building and Knowledge of African Municipal Development Funds”. The programme’s activities include:
          - conducting four specific studies on behalf of four network members, looking at ways to sustain and diversify their financial resources;
          - proposing action and training plans for these LGFIs, based on the recommendations of the four studies;
          - creating a RIAFCO website as a resource centre and discussion forum for its members;
          - providing cross-cutting support to help RIAFCO run its activities, raise its profile and develop its strategy.
        `,
      },
      {
        date: new Date("2017-01-01"),
        title: "2017: The joint RIAFCO, FMDV and UNCDF programme is implemented",
        description: `
          In 2017, the network focused its efforts on implementing the components of the “Promotion of Municipal Financial Markets through Capacity Building and Knowledge of African Municipal Development Funds” programme, in partnership with the FMDV and UNCDF and with support from the World Bank’s PPIAF. Four in-depth studies were carried out on behalf of FEICOM, Cameroon (access to climate finance); the Local Authorities National Investment Agency (ANICT), Mali (access to loans); the Local Development Fund (FDL), Madagascar (equalization mechanisms); and the National Agency for Local Authority Funding (ANFICT), Niger (sectoral funds, among other issues). The network also turned its attention to developing its website, and received cross-cutting support from programme partners.
        `,
      },
      {
        date: new Date("2018-03-29"),
        title: "2018: RIAFCO holds a Knowledge Transfer, Exchange and Dialogue workshop",
        description: `
          On 29-30 March 2018, RIAFCO held a workshop in Dakar, Senegal, to mark the end of the joint FMDV and UNCDF programme, focusing on ways to sustain and diversify financial resources.
        `,
      },
    ],
  });

  console.log("Seed pour HistoryItem terminé avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
