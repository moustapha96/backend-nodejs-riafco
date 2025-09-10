const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
    // Supprimer les données existantes pour éviter les doublons
    await prisma.activity.deleteMany({});

    // Créer une activité pour le renforcement des capacités
    await prisma.activity.create({
        data: {
            title_fr: "Renforcement des capacités",
            title_en: "Capacity Building",
            description_fr: `
        **Renforcer les IFCL, à travers la mise à disposition de ressources documentaires, de formation et d’expertise technique**

        Le RIAFCO, en développant une connaissance approfondie du contexte diversifié des IFCL, a reçu pour mandat d’appuyer ces instruments dans leurs missions et le développement de leurs activités respectives relatives au financement des investissements locaux.

        Ainsi, le RIAFCO vise d’une part à soutenir le déploiement des IFCL les plus fragiles et leur ouvrir le champ des perspectives pour une accélération de leur transformation sur la base de modèles éprouvés dans des contextes similaires.

        D’autre part, le RIAFCO souhaite soutenir l’évolution des IFCL les plus avancées dans leur modèle économique et de services aux collectivités locales.

        **Les appuis mis en place par le RIAFCO se déclinent en trois axes distincts :**

        - **Création d’une base de données inédite** sur les outils de financement spécifiques aux collectivités locales africaines, à travers la collecte des informations générales sur le cadre dans lequel évolue chaque IFCL (contexte politique et macro-économique national, environnement institutionnel, outils et lignes de financement disponibles, services fournis aux collectivités, potentiel du marché financier local, autres intervenants, etc.) et leur mise à disposition des membres.
          La plateforme en ligne joue un rôle important puisqu’elle permet la mise à disposition de toute une série de ressources documentaires et de formations en ligne consacrées au financement du développement des collectivités territoriales.

        - **Design d’ateliers de formation** à destination de ses membres, adaptés aux besoins constatés et exprimés par les IFCL, et qui se fondent sur des approches thématiques (péréquation, finance climat, emprunt, etc.). Un des facteurs de développement des IFCL et de leurs activités étant la formation de leurs équipes, le RIAFCO, au travers des études réalisées sur les IFCL et de questionnaires, cherche à évaluer les besoins en formation des IFCL, de manière à proposer des modules de formations appropriés.

        - **Facilitation de la mise en relation** des IFCL avec un pool d'experts internationaux spécialisés sur les thématiques en lien avec le financement des collectivités locales africaines, et un accompagnement possible en ingénierie financière à la demande de certains membres sur la base d'un maillage régional (conduite d’études au niveau national, régional, ou international, mise en œuvre de plans d’action, appui-conseil du RIAFCO, etc.).
      `,
            description_en: `
        **Strengthening LGFIs by providing literature, training, and technical expertise**

        RIAFCO has a thorough understanding of the diverse contexts in which local government financing institutions (LGFIs) operate. The network helps these institutions fulfil their remit and expand their local investment financing activities.

        One aspect of this work involves supporting the most vulnerable LGFIs, using proven models from other, similar contexts to unlock new possibilities and accelerate change.

        RIAFCO also supports more advanced LGFIs, helping them grow their business model and deliver services to local authorities.

        **The network’s support activities fall into three separate categories:**

        - **Creation of a unique database** of financing instruments for African local authorities. The database, which is accessible to network members, contains general information about the context in which each LGFI operates (national political and macroeconomic context, institutional environment, available financing lines and tools, services provided to local authorities, local financial market potential, other stakeholders, etc.).
          The network’s website is an important resource center where members can access a range of training modules and literature on development finance for local authorities.

        - **Design of thematic training workshops** for members based on observed and reported LGFI needs, covering topics such as equalization, climate finance, and loans. Since well-trained staff are vital to LGFIs growing their operations and activities, the network conducts studies and surveys to gauge their training needs and develop appropriate modules.

        - **Facilitation of connections** between LGFIs and a pool of international experts specializing in African local authority financing subjects, and provides regional support to members requesting financial engineering assistance (national, regional, or international studies, action plan implementation, RIAFCO support and advice, etc.).
      `,
            icon: "📚", // Icône pour représenter le renforcement des capacités
            image: "https://mistralaiblackforestprod.blob.core.windows.net/images/blackforest/a564/157a/-2c0/f-481c-9e15-b76175cc74d9/image.jpg?se=2025-09-09T20%3A50%3A16Z&sp=r&sv=2025-07-05&sr=b&sig=8/mU4CSFXuBPLzRLWy0iqK9N3laitY%2BkQk8LmkQIFKQ%3D",
            status: "PUBLISHED",
            authorId: "cmf0z37i70009iyx4kbuakf4h", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });
    await prisma.activity.create({
        data: {
            title_fr: "Programme de Promotion des Marchés Financiers Municipaux",
            title_en: "Promotion of Municipal Financial Markets Programme",
            description_fr: `
        **Programme de « Promotion des Marchés Financiers Municipaux à travers le renforcement des capacités et des connaissances des Fonds de Développement Municipaux africains »**

        Mené en partenariat avec le **FMDV** et **UNCDF**, et avec le concours financier du **PPIAF de la Banque mondiale**, ce programme vise à explorer les outils et moyens à mettre en œuvre pour encourager la pérennisation et la diversification des ressources financières des **IFCL**, et renforcer leurs services offerts aux collectivités locales.

        **Quatre activités principales** ont ainsi pu être menées au travers de ce programme :
        - La réalisation de **4 études spécifiques**, conduites au profit de 4 membres du réseau et portant sur les conditions de pérennisation et de diversification de leurs ressources financières.
        - La proposition de **plans d’actions et de formation** pour ces IFCL sur la base des recommandations issues des 4 études.
        - La création d’une **plateforme web du RIAFCO**, conçue comme un centre de ressources et un espace d’échange entre les membres.
        - Un **appui transversal** au RIAFCO dans son fonctionnement, sa visibilité et sa stratégie.

        **Atelier de clôture**
        Pour clore ce programme, le RIAFCO a organisé les **29 et 30 mars 2018 à Dakar (Sénégal)** un atelier réunissant ses membres sur le thème de la pérennisation et la diversification des ressources financières.

        Regroupant les membres du réseau, des experts, des partenaires techniques et financiers et les organisateurs du programme, l’atelier avait pour objectif de :
        - Poursuivre la dynamique d’animation du réseau en permettant aux membres de se rencontrer, d’échanger et de créer du lien.
        - Renforcer les capacités et les stratégies des membres via des sessions de partage d’expérience sur des thématiques communes.
        - Présenter et diffuser les résultats des activités du Programme, notamment les études thématiques.
        - Introduire le site internet du RIAFCO et sa plateforme d’échange dédiée entièrement à la vie du réseau.
        - Approfondir la réflexion stratégique sur l’avenir du réseau en identifiant notamment de prochaines activités à mettre en œuvre.
        - Organiser la rencontre des membres du réseau avec des partenaires techniques et financiers.
      `,
            description_en: `
        **“Promotion of Municipal Financial Markets through Capacity Building and Knowledge of African Municipal Development Funds” Programme**

        This programme, run in partnership with the **Global Fund for Cities Development (FMDV)** and the **United Nations Capital Development Fund (UNCDF)** and with support from the **World Bank’s Public-Private Infrastructure Advisory Facility (PPIAF)**, looks at ways to encourage local government financing institutions (LGFIs) to sustain and diversify their financial resources and strengthen the services they offer to local authorities.

        **The four main activities** carried out under the programme are as follows:
        - Conducting **four specific studies** on behalf of four network members, looking at ways to sustain and diversify their financial resources.
        - Proposing **action and training plans** for these LGFIs, based on the recommendations of the four studies.
        - Creating a **RIAFCO website** as a resource center and discussion forum for its members.
        - Providing **cross-cutting support** to help RIAFCO run its activities, raise its profile, and develop its strategy.

        **Closing Workshop**
        On **29-30 March 2018**, RIAFCO held a workshop in **Dakar, Senegal**, to mark the end of the programme, focusing on financial resource sustainability and diversification.

        The workshop, which was attended by network members, experts, technical and financial partners, and programme organizers, had the following aims:
        - To give members a chance to meet, talk, and build relationships to sustain the network’s momentum.
        - To build members’ capacities and strengthen their strategies through thematic experience-sharing sessions.
        - To share the programme’s outcomes, and the findings of the thematic studies in particular.
        - To unveil the RIAFCO website and the member discussion forum.
        - To deepen strategic thinking about the network’s future, including forthcoming activities.
        - To provide an opportunity for network members to meet technical and financial partners.
      `,
            icon: "🌍", // Icône pour représenter le programme thématique
            image: "https://mistralaiblackforestprod.blob.core.windows.net/images/blackforest/d66f/d934/-3df/5-4c7b-892c-4a606c2d2739/image.jpg?se=2025-09-09T20%3A52%3A41Z&sp=r&sv=2025-07-05&sr=b&sig=jXwWpFeb8Uih9//8ObfHaqT4L6wVQlVvCx/XirEt7tA%3D",
            status: "PUBLISHED",
            authorId: "cmf0z37i70009iyx4kbuakf4h", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });

    await prisma.activity.create({
        data: {
            title_fr: "Plaidoyer pour l'intermédiation financière",
            title_en: "Financial Intermediation Advocacy",
            description_fr: `
        **Porter le plaidoyer en faveur des IFCL, pour faire force de proposition et de représentation aux niveaux local, national et international auprès des acteurs de la décentralisation**

        La mise en réseau des IFCL, d'abord sur le continent africain, puis à l'international avec d'autres mécanismes nationaux de financement des investissements locaux, est aujourd'hui un moyen de capter les innovations les plus marquantes et les plus pérennes de ces dernières années, mais aussi de montrer de façon décisive leur pertinence auprès des gouvernements nationaux et des acteurs internationaux.

        Le RIAFCO cherche donc à capitaliser sur les meilleures pratiques, promouvoir les pratiques inspirantes, sensibiliser à des modalités d’interventions innovantes, pour ainsi impulser des dynamiques de réformes auprès de tous les acteurs de la décentralisation.

        Avec l’appui de ses partenaires, le RIAFCO porte la voix des IFCL et de ses membres dans les processus internationaux et auprès des partenaires techniques et financiers, et plaide pour la reconnaissance de leur rôle actif dans le financement de la décentralisation.

        Grâce notamment à un plaidoyer porté conjointement par le RIAFCO et le FMDV durant le processus préparatoire à Habitat III, les institutions de financement des collectivités locales (IFCL) ont été reconnues officiellement comme des catalyseurs de financements nationaux, internationaux, publics, institutionnels et privés vers les territoires et pour un développement local durable, résilient et inclusif.

        Pour la première fois, un texte des Nations Unies, le **Nouvel Agenda Urbain**, acté à Quito en octobre 2016 lors de la Conférence Habitat III, appelle ainsi les acteurs du développement à renforcer ou créer les IFCL.

        À ce titre, leur permettre de déployer leur assise institutionnelle, disposer des moyens humains, techniques et d’ingénierie nécessaires et suffisants pour assurer leur mandat, diversifier leurs sources de financement, et élargir leurs gammes de services financiers et techniques apportés aux gouvernements locaux et régionaux, constituent désormais une priorité.

        **Participation du RIAFCO ou de ses membres aux évènements internationaux :**
        - Conférence Financing for Development à Addis Abeba (Éthiopie) en juillet 2015
        - Sommet des Nations unies pour l’adoption de l’Agenda 2030 de développement durable à New York (USA) en septembre 2015
        - 7ème Sommet Africités tenu à Johannesburg (Afrique du Sud) en décembre 2015
        - Rencontre thématique sur le Nouvel Agenda Urbain du 8 au 11 mars 2016 à Mexico (Mexique) – Représenté par le secrétaire général et le président du RIAFCO
        - Colloque de Dakar (Sénégal), du 21 au 23 mars 2016 – Représenté par le président du RIAFCO
        - Forum sur le financement du développement durable : suivi de l’Agenda d'Addis-Abeba à l’initiative du Conseil Économique et Social (ECOSOC) de l’Organisation des Nations Unies (New York) du 23 au 26 avril 2016
        - Forum France - Côte d'Ivoire sur les solutions de financement et de développement, à Paris (France) en juillet 2016, représenté par le secrétaire permanent du RIAFCO
        - Conférence Habitat III à Quito (Équateur) du 16 au 20 octobre 2016 – Représenté par le président du RIAFCO
        - Climate Finance Day à Casablanca (Maroc) le 5 novembre 2016
        - Sommet des élus locaux et régionaux pour le climat, en marge de la COP22, à Marrakech (Maroc) le 14 novembre 2016
        - XIIè Congrès Mondial de Metropolis à Montréal (Canada) du 19 au 22 juin 2017 – Représenté par le président du RIAFCO
        - COP 23 à Bonn (Allemagne) du 6 au 17 novembre 2017
        - Forum Mondial Urbain à Kuala Lumpur (Malaisie) du 6 au 13 février 2018
      `,
            description_en: `
        **Advocating for the cause of LGFIs by lobbying and representing their interests to decentralization partners at the local, national and international levels**

        Building a network of local government financing institutions (LGFIs) – starting in Africa and later partnering with other national mechanisms for local investment around the world – is an effective way to harness recent flagship examples of sustainable, innovative practice, and to make a strong case for LGFIs to national governments and international partners.

        RIAFCO seeks to build on positive experiences, promote inspiring practice, disseminate innovative models, and build momentum for reform among all decentralization partners.

        With the backing of its partners, RIAFCO gives LGFIs and its members a voice in international processes and with technical and financial partners, advocating for recognition of the vital role they play in financing decentralization.

        Joint advocacy efforts between RIAFCO and the Global Fund for Cities Development (FMDV) in the run-up to the Habitat III Conference led to official recognition of the role of LGFIs as catalysts for national and international public, institutional and private financing to foster sustainable, resilient, inclusive local development.

        In October 2016, the United Nations adopted the **New Urban Agenda** at the Habitat III Conference in Quito, Ecuador – the first time the organization had officially encouraged development partners to create or strengthen LGFIs.

        The priority now is to strengthen the institutional foundations of LGFIs, to ensure they have the human, technical and engineering resources they need to fulfil their remit, to diversify their sources of finance, and to expand the range of financial and technical services they provide to local and regional governments.

        **RIAFCO or its member LGFIs have attended the following international events:**
        - Third International Conference on Financing for Development (Addis Ababa, Ethiopia, July 2015)
        - United Nations Sustainable Development Summit (New York, United States, September 2015)
        - Seventh Africités Summit (Johannesburg, South Africa, December 2015)
        - Habitat III Thematic Meeting (Mexico City, Mexico, 8-11 March 2016) – Represented by the RIAFCO secretary-general and president
        - Dakar Conference (Dakar, Senegal, 21-23 March 2016) – Represented by the RIAFCO president
        - United Nations Economic and Social Council (ECOSOC) forum: “Financing for sustainable development: follow-up to the Addis Ababa Action Agenda” (New York, United States, 23-26 April 2016)
        - France-Côte d’Ivoire forum on development finance solutions (Paris, France, July 2016) – Represented by the RIAFCO permanent secretary
        - Habitat III Conference (Quito, Ecuador, 16-20 October 2016) – Represented by the RIAFCO president
        - Climate Finance Day (Casablanca, Morocco, 5 November 2016)
        - Climate Summit for Local and Regional Leaders, a COP22 side event (Marrakesh, Morocco, 14 November 2016)
        - 12th Metropolis World Congress (Montreal, Canada, 19-22 June 2017) – Represented by the RIAFCO president
        - COP23 (Bonn, Germany, 6-17 November 2017)
        - World Urban Forum (Kuala Lumpur, Malaysia, 6-13 February 2018)
      `,
            icon: "🗣️", // Icône pour représenter le plaidoyer
            image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
            status: "PUBLISHED",
            authorId: "cmf0z37i70009iyx4kbuakf4h", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });

    await prisma.activity.create({
        data: {
            title_fr: "Échanges entre Pairs",
            title_en: "Peer-to-Peer Exchange",
            description_fr: `
        **Encourager les échanges entre pairs, à travers le partage d’expériences et d’informations sur le cadre dans lequel évolue chaque IFCL**

        Bien que les IFCL du continent africain relèvent de réalités bien différentes selon leurs contextes nationaux, ces institutions ont beaucoup à apprendre les unes des autres. L’échange institutionnel et technique entre pairs est ainsi l’une des vocations principales de la mise en réseau des IFCL africaines à travers le RIAFCO.

        Ce mode d’apprentissage encouragé par le RIAFCO permet de partager les bonnes pratiques comme les expériences négatives, et ainsi de renforcer les connaissances des IFCL en leur offrant de nouvelles inspirations pour leur activité au quotidien. Ces échanges sont également moteurs d’un renforcement de la solidarité entre les IFCL membres du RIAFCO.

        Depuis la création du RIAFCO, plusieurs voyages d’étude ont ainsi été encadrés pour permettre à une IFCL de se rendre dans le pays d’une IFCL pair pour quelques jours d’échanges et de visites de terrain.

        La création de la **plateforme de partage en ligne** (accès privé au site web du RIAFCO) contribue également à la facilitation des échanges entre les membres du RIAFCO, en leur offrant la possibilité de publier du contenu et des informations qu’elles jugent utiles pour leurs pairs.
      `,
            description_en: `
        **Fostering peer-to-peer exchange by encouraging members to share their experiences and information about their environment**

        Although they operate in very different national contexts, Africa’s local government financing institutions (LGFIs) have plenty to learn from one another, making peer-to-peer institutional and technical exchange one of the main purposes of the network.

        RIAFCO actively encourages its members to share best practices and negative experiences alike – a process that builds their knowledge and helps inspire their everyday work. Exchange of this kind also helps build solidarity between member LGFIs.

        Since its inception, RIAFCO has given LGFIs an opportunity to undertake a study visit to a fellow member’s country, typically involving several days’ discussion and field tours.

        The new **online forum** (a member-only area of the RIAFCO website) also helps foster exchange between network members, giving them an opportunity to publish content and information they believe their peers might find useful.
      `,
            icon: "🤝", // Icône pour représenter les échanges entre pairs
            image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
            status: "PUBLISHED",
            authorId: "cmf0z37i70009iyx4kbuakf4h", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });
    console.log("Seed pour Activity (Renforcement des capacités) terminé avec succès.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });






