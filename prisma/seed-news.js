const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();


async function main() {
    // Supprimer les données existantes pour éviter les doublons
    await prisma.news.deleteMany({});

    // Créer une actualité pour la visite d'étude et de coopération
    await prisma.news.create({
        data: {
            title_fr: "Visite d'étude et de coopération de l'ANFICT du Niger au FEICOM du Cameroun",
            title_en: "Niger’s ANFICT undertakes a study and cooperation visit to Cameroon’s FEICOM",
            content_fr: `
        **Le RIAFCO coordonne un voyage d'étude d'une délégation de l'ANFICT auprès de leurs pairs du FEICOM au Cameroun**

        Dans le cadre de sa mission de renforcer les échanges entre les IFCL, le RIAFCO a facilité la visite d’une délégation de l'Agence Nationale de Financement des Collectivités Territoriales du NIGER (ANFICT) au Cameroun du 15 au 20 août 2017 dans le cadre d'un échange peer-to-peer avec le FEICOM.

        Les échanges entre les deux IFCL ont porté sur les missions, l'organisation, le fonctionnement et les activités du FEICOM.

        Une descente a également eu lieu à l'Observatoire du Développement Local (ODL) Gilbert Biwole où les équipes de l’ANFICT ont échangé avec les équipes du FEICOM sur les objectifs et activités de l'ODL.

        Les membres de la délégation de l'ANFICT, sous la houlette du Directeur Général du FEICOM, ont également été reçus en audience le 16 août 2017, par le Ministre de l’Habitat et du Développement Urbain, Jean Claude MBWENTCHOU (MINHDU). Durant cet entretien, le MINHDU a évoqué les missions de son département ministériel et mis l’emphase sur les projets majeurs qui y sont en cours. L’urbaniste a en outre indiqué que le FEICOM est gestionnaire d’une ligne ouverte par le Crédit Foncier du Cameroun au FEICOM, en faveur des Communes bénéficiaires du Programme de Construction des Cités Municipales (PCCM).
      `,
            content_en: `
        **RIAFCO arranges a peer-to-peer study visit for a delegation from Niger’s ANFICT to Cameroon’s FEICOM**

        As part of its remit to foster exchange between local government financing institutions (LGFIs), RIAFCO arranged for a delegation from Niger’s National Agency for Local Authority Funding (ANFICT) to travel to Cameroon for a peer-to-peer study visit with Cameroon’s Special Fund for Equipment and Inter-Municipal Intervention (FEICOM) on 15-20 August 2017.

        During the visit, the two LGFIs discussed what FEICOM’s work involves, how the institution is organized, how it operates and its activities.

        The Nigerien delegation also visited the Gilbert Biwole Local Development Observatory, where they talked to FEICOM officials about the observatory’s work.

        On 16 August 2017, ANFICT delegates also met with Jean Claude Mbwentchou, Cameroon’s Minister for Housing and Urban Development, accompanied by the FEICOM Director General. At the meeting, the minister talked about what his department does and outlined some of the key projects it is currently working on. He also explained that FEICOM manages a line of credit extended by Crédit Foncier du Cameroun, the country’s national mortgage bank, for local authorities involved in the Construction Programme for Municipal Cities (PCCM).
      `,
            image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
            status: "PUBLISHED",
            publishedAt: new Date("2017-08-20"),
            authorId: "default-author-id", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });

    await prisma.news.create({
        data: {
            title_fr: "Une nouvelle identité visuelle pour le RIAFCO",
            title_en: "RIAFCO undergoes a rebrand",
            content_fr: `
        **Dans le cadre de ses efforts de consolidation, le RIAFCO se dote d'une nouvelle identité visuelle qui s'articulera autour d'un nouveau logo**

        Pour entrer confortablement dans l’année 2018, le RIAFCO a choisi de se doter d’un nouveau logo pour le représenter ainsi que ses membres. Le logo représente ainsi le continent africain tout en faisant référence à la notion de mise en réseau suggérée par l’entrelacement de ses lignes de contour.

        Épurée et moderne, cette nouvelle identité visuelle permettra au réseau de se donner une visibilité accrue auprès de ses membres et des partenaires avec qui il travaille.
      `,
            content_en: `
        **RIAFCO adopts a new logo to support its consolidation efforts**

        For 2018, RIAFCO has adopted a new logo to represent the network and its members. The logo symbolizes the continent of Africa, while the intertwining contour lines are a nod to RIAFCO’s network structure.

        This sleek, modern logo will help raise the network’s profile among members and partners.
      `,
            image: "", // Vous pouvez ajouter une URL d'image du nouveau logo ici
            status: "PUBLISHED",
            publishedAt: new Date("2018-01-01"), // Date de publication estimée
            authorId: "default-author-id", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });

    await prisma.news.create({
        data: {
            title_fr: "Programme de « Promotion des Marchés Financiers Municipaux à travers le renforcement des capacités et des connaissances des Fonds de Développement Municipaux africains »",
            title_en: "“Promotion of Municipal Financial Markets through Capacity Building and Knowledge of African Municipal Development Funds” programme",
            content_fr: `
        **Lancé en 2016 en partenariat avec le FMDV et UNCDF, et avec le soutien du PPIAF de la Banque mondiale, le programme pour la « Promotion des Marchés Financiers Municipaux à travers le renforcement des capacités et des connaissances des Fonds de Développement Municipaux africains » vise à appuyer la pérennisation et diversification des ressources financières des Institutions de Financement des Collectivités Locales.**

        Quatre activités principales composent ce programme :
        - La réalisation de 4 études spécifiques, conduites au profit de 4 membres du réseau et portant sur les conditions de pérennisation et de diversification de leurs ressources financières ;
        - La proposition de plans d’actions et de formation pour ces IFCL sur la base des recommandations issues des 4 études ;
        - La création d’une plateforme web du RIAFCO, conçue comme un centre de ressources et un espace d’échange entre les membres ;
        - Un appui transversal au RIAFCO dans son fonctionnement, sa visibilité et sa stratégie.

        Pour clore ce programme, le RIAFCO organise les 29 et 30 mars 2018 à Dakar (Sénégal) un atelier réunissant ses membres sur le thème de la pérennisation et la diversification des ressources financières.
      `,
            content_en: `
        **The “Promotion of Municipal Financial Markets through Capacity Building and Knowledge of African Municipal Development Funds” programme, launched in 2016 in partnership with the Global Fund for Cities Development (FMDV) and the United Nations Capital Development Fund (UNCDF) and with support from the World Bank’s Public-Private Infrastructure Advisory Facility (PPIAF), aims to strengthen financial resource sustainability and diversification for LGFIs.**

        The programme features four main activities:
        - Conducting four specific studies on behalf of four network members, looking at ways to sustain and diversify their financial resources;
        - Proposing action and training plans for these LGFIs, based on the recommendations of the four studies;
        - Creating a RIAFCO website as a resource centre and discussion forum for its members;
        - Providing cross-cutting support to help RIAFCO run its activities, raise its profile and develop its strategy.

        On 29-30 March 2018, RIAFCO held a workshop in Dakar, Senegal, to mark the end of the programme, focusing on financial resource sustainability and diversification.
      `,
            image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
            status: "PUBLISHED",
            publishedAt: new Date("2016-01-01"), // Date de lancement du programme
            authorId: "default-author-id", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });

    await prisma.news.create({
        data: {
            title_fr: "ATELIER D'ÉCHANGE, DE RESTITUTION & DE DIALOGUE STRATÉGIQUE DES MEMBRES DU RIAFCO",
            title_en: "RIAFCO members’ exchange, restitution & strategic dialogue workshop",
            content_fr: `
        **Le RIAFCO organise les 29 et 30 mars 2018 à Dakar (Sénégal) un atelier réunissant ses membres sur le thème de la pérennisation et la diversification des ressources financières.**

        À l'heure où les récents accords internationaux majeurs (Nouvel Agenda Urbain, Objectifs du Développement Durable, l'Accord de Paris, Programme d'Action d'Addis-Abeba) reconnaissent le rôle de premier plan joué par les collectivités locales pour relever les défis du développement, la question de la localisation et de la diversification du financement est au cœur des préoccupations.

        Grâce notamment à un plaidoyer porté conjointement par le RIAFCO et le FMDV durant le processus préparatoire à Habitat III, les institutions de financement des collectivités locales (IFCL) ont été reconnues officiellement comme des catalyseurs de financements nationaux, internationaux, publics, institutionnels et privés vers les territoires et pour un développement local durable, résilient et inclusif.

        Pour la première fois, un texte onusien, le Nouvel Agenda Urbain, acté à Quito en octobre 2016 lors de la Conférence Habitat III, appelle ainsi les acteurs du développement à renforcer ou créer les IFCL.

        À ce titre, leur permettre de déployer leur assise institutionnelle, disposer des moyens humains, techniques et d’ingénierie nécessaires et suffisants pour assurer leur mandat, diversifier leurs sources de financement, et élargir leurs gammes de services financiers et techniques apportés aux gouvernements locaux et régionaux, constituent désormais une priorité.

        C’est dans cet esprit que dès 2014, fut créé le Réseau des Institutions Africaines de Financement des Collectivités Locales (RIAFCO), initiative innovante, aujourd’hui composée de sept membres actifs. Le RIAFCO vise à favoriser l’échange institutionnel et technique pair-à-pair, promouvoir les pratiques inspirantes, sensibiliser à des modalités d’interventions innovantes et porter la voix de ses membres dans les processus internationaux et auprès des partenaires techniques et financiers.

        L’une des premières activités majeures du RIAFCO fut de développer, en partenariat avec le FMDV et UNCDF, et avec le soutien du PPIAF de la Banque mondiale, le programme pour la « Promotion des Marchés Financiers Municipaux à travers le renforcement des capacités et des connaissances des Fonds de Développement Municipaux africains ».

        Pour clore ce programme, le RIAFCO organise les 29 et 30 mars 2018 à Dakar (Sénégal) un atelier réunissant ses membres sur le thème de la pérennisation et la diversification des ressources financières.

        La rencontre s'inscrit en conclusion des activités du programme susmentionné, dont notamment :
        1. La réalisation de 4 études spécifiques, conduites au profit de 4 membres du réseau et portant sur les conditions de pérennisation et de diversification de leurs ressources financières ;
        2. La proposition de plans d’actions et de formation pour ces IFCL sur la base des recommandations issues des 4 études ;
        3. La création d’une plateforme web du RIAFCO, conçue comme un centre de ressources et un espace d’échange entre les membres ;
        4. Un appui transversal au RIAFCO dans son fonctionnement, sa visibilité et sa stratégie.

        Regroupant les membres du réseau, des experts, des partenaires techniques et financiers et les organisateurs du programme, l’atelier visera particulièrement à :
        1. Poursuivre la dynamique d’animation du réseau en permettant aux membres de se rencontrer, d’échanger et de créer du lien ;
        2. Renforcer les capacités et les stratégies des membres via des sessions de partage d’expérience sur des thématiques communes ;
        3. Présenter et diffuser les résultats des activités du Programme, notamment les 4 études thématiques ;
        4. Introduire la plateforme web dédiée entièrement à la vie du réseau ;
        5. Approfondir la réflexion stratégique sur l’avenir du réseau en identifiant notamment de prochaines activités à mettre en œuvre ;
        6. Organiser la rencontre des membres du réseau avec des partenaires techniques et financiers.
      `,
            content_en: `
        **RIAFCO holds on March 29th and 30th 2018 in Dakar, Senegal, a workshop gathering its members around the theme of perpetuation and diversification of financial resources.**

        As recent major international agreements (New Urban Agenda, Sustainable Development Goals, Addis Ababa Action Agenda, Paris Agreement) recognize the prime role of local authorities in meeting development challenges, the issue of financing localization and diversification is central for development actors and an ever-growing number of Governments.

        Through the joint advocacy of RIAFCO and the FMDV during the Habitat III preparatory process, Local Government Financing Institutions (LGFIs) have officially been recognized as catalyzers for national, international, public, institutional and private financing towards local authorities for sustainable, resilient and inclusive local development.

        For the first time, a UN text, the New Urban Agenda, acted in Quito in October 2016, during the Habitat III Conference, calls on development stakeholders to reinforce or create LGFIs. On this basis, enabling LGFIs to deploy their institutional foundation, to possess necessary and sufficient human, technical and engineering means to carry out their mandate, diversify their financial sources, and expand the ranges of financial and technical services intended for local authorities, now represent a priority.

        It is in this perspective that has been created in 2014 the Network of African Local Government Financing Institutions (RIAFCO), an innovative initiative, now comprising seven active members. RIAFCO aims to foster institutional and technical peer-to-peer exchange, to promote inspiring practices, to sensitize actors to innovative intervention methods, and to make the voice of its members heard in international negotiations and in interactions with technical and financial stakeholders.

        One of the first major activities of RIAFCO was to develop, in partnership with FMDV and UNCDF, and with support from the World Bank PPIAF facility, the « Promotion of Municipal Financial Markets through Capacity and Knowledge Building of African Municipal Development Funds » program.

        As a closing for the program, RIAFCO holds on March 29th and 30th 2018 in Dakar, Senegal, a workshop gathering its members around the perpetuation and diversification of financial resources.

        The meeting concludes the activities of the aforementioned program, notably by:
        1. Conducting four specialized studies for the benefit of four network members concerning the conditions of perpetuation and diversification of their financial resources;
        2. Proposing training and action plans for LGFI members on the basis of recommendations from the four specialized studies;
        3. The creation of an online RIAFCO platform, designed as a resource center and a space for exchange between member LGFIs;
        4. Providing transversal support to the RIAFCO in its functioning, visibility and strategy.

        Gathering network members, experts, technical and financial partners, and program organizers, the workshop aims more particularly to:
        1. Pursue a dynamic animation of the network by enabling members to meet, exchange and create links;
        2. Reinforce members’ capabilities and strategies through experience sharing sessions on common topics;
        3. Present and disseminate the Program’s activity results, notably the four thematic studies;
        4. Introduce the online platform entirely dedicated to the continuation of the network;
        5. Deepen strategic thinking on the future of the network by identifying future activities to implement;
        6. Organize meetings between network members and technical and financial stakeholders.
      `,
            image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
            status: "PUBLISHED",
            publishedAt: new Date("2018-03-29"), // Date de l'atelier
            authorId: "default-author-id", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });

    await prisma.news.create({
        data: {
            title_fr: "Bilan de l’atelier des membres du RIAFCO à Dakar, Sénégal",
            title_en: "Summary of the RIAFCO workshop held in Dakar, Senegal",
            title_es: "Intermediación financiera: el FMDV coorganizó un taller para los miembros de la Red de Instituciones Africanas de Financiamiento de los Gobiernos Locales (RIAFCO)",
            content_fr: `
        **Le FMDV est engagé à renforcer le rôle des intermédiations financières nationales dans le financement des gouvernements locaux et régionaux.**

        À ce titre, un programme d’appui au RIAFCO est mis en œuvre depuis 2016 par le FMDV et UNCDF, avec l’appui financier du PPIAF de la Banque mondiale. L’atelier qui en présentait les conclusions et les perspectives a réuni des institutions de 11 pays d’Afrique.

        **Rencontre inédite** regroupant une quarantaine de participants issus de onze pays d’Afrique (Bénin, Burkina Faso, Burundi, Cameroun, Côte d’Ivoire, Gabon, Madagascar, Mali, Mauritanie, Niger et Sénégal), l’atelier a permis de regrouper les Institutions de Financement des Collectivités Locales (IFCL) membres actives et observatrices du RIAFCO ainsi que les partenaires techniques et financiers (Banque mondiale, AFD, USAID, UNCDF, FMDV, PPIAF) afin d’échanger sur le thème de la pérennisation et la diversification de leurs ressources financières.

        Après une introduction des autorités sénégalaises représentées par M. Alassane SOW, directeur de cabinet au sein du Ministère de la Gouvernance Territoriale, du Développement et de l’Aménagement du Territoire, ainsi que du FEICOM en qualité de président du Réseau, les partenaires du programme dont le FMDV représenté par sa directrice régionale pour l’Afrique, Mme Carole GUILLOUX, ont présenté leur stratégie d’appui au RIAFCO et l’importance de soutenir les IFCL pour renforcer la localisation des financements.

        **Première session thématique** : La péréquation
        Après une présentation conceptuelle réalisée par les experts mobilisés, le Fonds de Développement Local (FDL) de Madagascar a présenté son expérience en cours de gestion d’un nouveau Fonds National de Péréquation (FNP). Chaque IFCL a ensuite pris la parole pour exposer son expérience sur les transferts de péréquation et les difficultés rencontrées. Il a été ressorti notamment que la gestion performante d’un fonds de péréquation par une IFCL est une étape importante pour démontrer leur plus-value.

        **Seconde session thématique** : L’accès à de nouvelles ressources de financement
        Après de nouveaux exposés conceptuels des experts, le FEICOM du Cameroun et l’ANICT du Mali ont présenté leurs initiatives en cours pour être accrédité au Fonds Vert Climat (FVC) notamment. Ces échanges ont permis de constater la complexité de ces démarches et le chemin encore à parcourir pour que les IFCL africaines répondent aux critères requis par ces mécanismes.

        **Deuxième journée** : Réflexion stratégique collective
        La seconde journée a offert un temps pour mener une réflexion stratégique collective sur l’avenir du réseau et identifier des nouvelles pistes d’action. Il a notamment été discuté un projet de feuille de route de Dakar où les IFCL ont appelé à un soutien renforcé aux activités du RIAFCO et de ses membres sur les volets suivants :
        - Contribuer à faciliter la mobilisation des investissements locaux et au renforcement des collectivités territoriales à travers la canalisation des dotations des États et des partenaires, la mise en place de lignes de crédit, de garantie, et autres produits financiers adéquats, l’appui technique à la planification/programmation, la gestion financière et le renforcement des capacités ;
        - Rendre disponible les informations agrégées et/ou actualisées sur les collectivités territoriales et le financement de la décentralisation ;
        - Produire une base de données sur l'état des lieux des IFCL dans les différents pays d'Afrique, avec des comparatifs sur les modèles les plus avancés, les facteurs de succès, les leçons apprises ;
        - Participer à la reconnaissance nationale et internationale des IFCL, en vue d’une action concertée dans le cadre des dialogues nationaux sur le financement et les instruments de la décentralisation effective et du développement local inclusif, la recherche de complémentarité et de cohérence dans les interventions des parties prenantes ;
        - Favoriser la coopération technique et institutionnelle entre pairs accompagnée d'un travail de soutien aux échanges entre les ministères de tutelle qui ont soutenu le développement de l'IFCL dans leur pays ;
        - Favoriser la mobilisation d'ingénierie et d'expertise à travers l’organisation d’un répertoire d’experts et une meilleure connexion avec les centres et espaces nationaux et régionaux de formation ;
        - Rechercher conjointement des financements via les coopérations sous régionales (zones économiques) ou par le biais de programmes définis par le RIAFCO.

        Enfin, l’atelier s’est conclu d’abord sur une session de rencontre entre les IFCL et les PTF afin d’améliorer la compréhension mutuelle de leurs besoins et modes opératoire, puis par des sessions d’échanges P2P pour approfondir l’échange d’expériences bilatérales entre les IFCL.

        La prochaine rencontre des membres du RIAFCO devrait avoir lieu en novembre 2018 lors de la conférence Africités qui sera organisée à Marrakech (Maroc).

        **Téléchargement** : feuille de route de Dakar
      `,
            content_en: `
        **The Global Fund for Cities Development (FMDV) is committed to strengthening the role of national financial intermediation in financing local and regional governments.**

        On this basis, in 2016 the FMDV partnered with the United Nations Capital Development Fund (UNCDF) to implement a two-year support programme for RIAFCO, with financial support from the World Bank’s Public-Private Infrastructure Advisory Facility (PPIAF). The workshop to present the programme’s findings and perspectives brought together institutions from 11 African countries.

        This unprecedented meeting brought together around 40 participants from 11 African countries (Benin, Burkina Faso, Burundi, Cameroon, Ivorian Coast, Gabon, Madagascar, Mali, Mauritania, Niger and Senegal), including local government funding agencies (LGFAs) and RIAFCO active members or observers, as well as the network’s technical and financial partners (World Bank, AFD, USAID, UNCDF, FMDV, PPIAF), to discuss how to sustain and diversify their financial resources.

        After an introduction by Mr. Alassane Sow (Chief of Staff of the Ministry of Territorial Governance, Development and Land Planning) on behalf of the Senegalese authorities, and the network’s president (Cameroon’s Special Fund for Equipment and Inter-Municipal Intervention – FEICOM), the programme partners, represented by Mrs. Carole Guilloux (FMDV Regional Director for Africa), presented their strategy to support RIAFCO and underlined the importance of supporting LGFAs in strengthening funding localization.

        **First Thematic Session: Equalization**
        Following a conceptual presentation by the experts enlisted, the Local Development Fund (FDL) of Madagascar presented its ongoing experience of managing a new National Equalization Fund (FNP). Each LGFA then took to the floor to present its experience of equalization transfers and the difficulties encountered. It was noted that an LGFA’s efficient management of an equalization fund is an important step in demonstrating the added value of LGFAs.

        **Second Thematic Session: Access to New Financial Resources**
        After more conceptual presentations by the experts, Cameroon’s FEICOM and Mali’s Local Authorities National Investment Agency (ANICT) presented their current initiatives to be accredited by the Green Climate Fund (GCF). These exchanges were a chance to note the complexity of these approaches and the gap that African LGFAs could fill to help meet the criteria required by these mechanisms.

        **Second Day: Collective Strategic Reflection**
        The second day provided time for collective strategic reflection on RIAFCO’s future and to identify new action pathways. In particular, a Dakar Road Map was discussed, with LGFAs calling for it to provide stronger support for the activities of RIAFCO and its members in the following areas:
        - Help facilitate the mobilization of local investments and strengthen local governments by channelling allocations from states and partners, establishing credit lines, guarantees and other appropriate financial products, and providing technical support to planning/programming, financial management and capacity building;
        - Make available aggregated and/or updated information on local authorities and on the financing decentralization process;
        - Produce a database on LGFAs in different African countries, containing comparisons between the most advanced models, success factors and lessons learned;
        - Participate in recognizing LGFAs at national and international levels, to ensure concerted action in the framework of national dialogues on financing decentralization and implementing effective instruments, the search for complementarity and coherence among intervention stakeholders;
        - Promote technical and institutional peer-to-peer cooperation, and support exchanges between the line ministries that have supported LGFA development in their country;
        - Promote the mobilization of expertise by organizing a directory of experts and improving connections with national and regional training centres;
        - Seek joint funding through subregional cooperation (economic zones) or through RIAFCO programmes.

        Finally, the workshop ended with a meeting between the LGFAs and the technical and financial partners (TFPs) to improve their mutual understanding of each other’s needs and modus operandi, followed by peer-to-peer exchange sessions to deepen LGFAs’ exchange of bilateral experiences.

        The next meeting of RIAFCO members is scheduled to take place in November 2018 at the Africités conference, to be held in Marrakech (Morocco).

        **Download: Dakar Road Map**
      `,
            content_es: `
        **El FMDV se compromete a fortalecer el papel de la intermediación financiera nacional en el financiamiento de los gobiernos locales y regionales.**

        En este contexto, el FMDV en colaboración con el UN Capital Development Fund (UNCDF) han venido implementando desde el año 2016 un programa de acompañamiento a la red RIAFCO con el apoyo financiero de la PPIAF del Banco Mundial. Este taller cuyo objetivo era presentar las diferentes conclusiones y perspectivas del programa contó con la participación de 11 instituciones financieras africanas.

        Este encuentro sin precedentes reunió a unos cuarenta participantes de once países africanos (Benin, Burkina Faso, Burundi, Camerún, Costa de Marfil, Gabón, Madagascar, Mali, Mauritania, Níger y Senegal) entre los cuales se encontraban: representantes de las Instituciones de Financiamiento de los Gobiernos Locales (IFCL), los miembros activos y observadores de la red RIAFCO, así como sus socios técnicos y financieros (Banco Mundial, AFD, USAID, FNUDC, FMDV, PPIAF) para discutir el tema de la sostenibilidad y la diversificación de los recursos financieros.

        Después de una introducción de las Autoridades Senegalesas por parte del Sr. Alassane Cerda, en tanto que director de gabinete del Ministerio de la Gobernanza, Desarrollo y Ordenamiento Territorial y director del FEICOM, institución que preside la red. En su calidad de socio del programa, el FMDV, representado por Carole Guilloux su directora regional para Africa, presentó su estrategia de apoyo a la red RIAFCO y la importancia de sostener las IFCL para reforzar la localización de las finanzas.

        Posteriormente, se llevó a cabo la primera sesión temática sobre el tema de ecualización, donde después de una presentación conceptual por parte de los expertos movilizados, el Fondo de Desarrollo Local (FDL) de Madagascar presentó su experiencia en la creación de un nuevo Fondo Nacional de Ecualización (FNP por sus siglas en francés). Luego, cada IFCL tomó la palabra para presentar su experiencia en transferencias de ecualización y las dificultades encontradas. En particular, se observó que la gestión eficiente de un fondo de ecualización por parte de una IFCL es un paso importante para demostrar su valor agregado.

        La segunda sesión temática del día estuvo centrada en el acceso a nuevos recursos financieros por parte de las IFCL, incluyendo las finanzas climáticas y el endeudamiento. Luego de unas breves explicaciones conceptuales por parte de expertos invitados, el FEICOM de Camerún y el ANICT de Mali presentaron sus experiencias en el proceso para ser acreditados por el Fondo Verde para el Clima (FVC). Estos intercambios permitieron observar la complejidad de estos enfoques y el camino que aún falta por recorrer para que las IFCL africanas logren cumplir con los criterios de selección de estos mecanismos.

        Durante la segunda jornada, se abrió el espacio para una reflexión estratégica colectiva sobre el futuro de la red y para identificar nuevas pistas de acción. Se trabajó en particular en un proyecto de Hoja de Ruta de Dakar, donde las IFCL hacen un llamado que las actividades de la red RIAFCO y las de sus miembros reciban más apoyo, especialmente en las siguientes áreas:
        - La movilización de la inversión local y el fortalecimiento de las autoridades locales a través de la canalización de las asignaciones de los Estados miembro, el establecimiento de líneas de crédito, garantías y otros productos financieros apropiados, apoyo técnico para la planificación / programación, la gestión financiera y el desarrollo de capacidades;
        - Poner a disposición información complementaria y/o actualizada sobre las autoridades locales y el financiamiento de la descentralización;
        - Producir una base de datos sobre el estado de las IFCL en diferentes países africanos, con comparaciones de los modelos más avanzados, factores de éxito, lecciones aprendidas;
        - Participar en el reconocimiento nacional e internacional de las IFCL, con miras a una acción concertada en el marco de los diálogos nacionales sobre financiamiento e instrumentos de descentralización efectiva y desarrollo local inclusivo, la búsqueda de complementariedad y la coherencia en las intervenciones de las partes interesadas;
        - Promover la cooperación técnica e institucional entre homólogos y el apoyo a los intercambios entre los ministerios que apoyan el desarrollo de las IFCL en sus respectivos países.
        - Promover la movilización de la ingeniería y la experiencia a través de la organización de un directorio de expertos y una mejor articulación entre los centros nacionales y regionales de formación;
        - Buscar financiamiento en forma conjunta a través de la cooperación subregional (zonas económicas) o mediante programas definidos por la red RIAFCO.

        Para finalizar el taller, se realizó una sesión de diálogo entre las IFCL y sus socios técnicos y financieros para mejorar la mutua comprensión de sus necesidades y modus operandi, seguida de una sesión de intercambios P2P para profundizar el intercambio de experiencias bilaterales entre IFCL.

        El FMDV está muy satisfecho con su contribución a este trabajo y sus resultados que permitieron fortalecer la convergencia entre las IFCL del continente africano y los socios de desarrollo al identificar líneas de actividades prometedoras para fortalecer la red RIAFCO y sus miembros en el corto y mediano plazo.

        La próxima reunión de los miembros de la red RIAFCO tendrá lugar en noviembre de 2018 en la conferencia « Africités » que se celebrará en Marrakech (Marruecos).

        **Descargar: Hoja de Ruta de Dakar**
      `,
            image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
            status: "PUBLISHED",
            publishedAt: new Date("2018-04-01"), // Date de publication estimée après l'atelier
            authorId: "default-author-id", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });

    await prisma.news.create({
        data: {
            title_fr: "Feuille de Route de Dakar - RIAFCO",
            title_en: "Dakar Roadmap - Network of African Local Government Financing Institutions (RIAFCO)",
            content_fr: `
        **« Intermédiation Financière Infranationale : Un Avenir Durable pour l'Investissement Local »**

        Nous, Institutions de Financement des Collectivités Locales (IFCL), représentant dix pays africains, réunis dans le cadre de l'Atelier d'Échange, de Restitution et de Dialogue Stratégique du Réseau des Institutions Africaines de Financement des Collectivités Locales (RIAFCO) tenu les 29 et 30 mars 2018 à Dakar, Sénégal :

        Considérant le rôle crucial des gouvernements locaux et régionaux dans la mise en œuvre des récents accords internationaux majeurs (Nouvel Agenda Urbain, Objectifs de Développement Durable/Agenda 2030, Accord de Paris, Programme d'Action d'Addis-Abeba sur le Financement du Développement – en particulier à travers l’Article 34), et tel que réaffirmé dans la Charte Africaine des valeurs et principes de la décentralisation, de la gouvernance locale et du développement local (2014) ;

        Sur la base du rôle des gouvernements locaux et régionaux en tant que partenaires principaux des gouvernements centraux, en soutien au développement économique inclusif des territoires, et à la production de services et infrastructures durables pour les citoyens ;

        Accueillons avec intérêt l'inclusion de la localisation, de l'hybridation et de la diversification des sources de financement des autorités locales et régionales au cœur des préoccupations des acteurs du développement et d'un nombre croissant de gouvernements centraux ;

        Reconnaissons ici l'adoption de la volonté inébranlable des gouvernements nationaux de créer ou renforcer les Institutions de Financement des Collectivités Locales, consignée pour la première fois dans un texte des Nations Unies – en l'occurrence, le Nouvel Agenda Urbain, adopté à Quito en octobre 2016, lors de la Conférence Habitat III (Art.139).

        Par nos interactions, nous réaffirmons le rôle des IFCL :
        - En tant que catalyseurs de financements nationaux et internationaux, publics, institutionnels et privés vers les territoires et pour un développement local durable, résilient, sobre en carbone et inclusif, permettant de réduire le déficit en infrastructures et services essentiels ;
        - En tant que mécanismes de mobilisation et d'allocation de ressources, par la mise en œuvre d'instruments financiers appropriés, l'assistance technique et financière aux collectivités locales, et le suivi et l'évaluation de l'utilisation efficace des fonds ;
        - Dans la création et le développement de marchés locaux de prêt, en tant qu'éléments clés dans la diversification des ressources des gouvernements locaux, l'augmentation des volumes d'investissement, le renforcement de leurs capacités d'action et de leur autonomie, et pour l'innovation.

        Rappelant que pour servir le but de renforcement mutuel, les IFCL africaines se sont regroupées, dès 2014, pour former le RIAFCO, un réseau dont les objectifs sont les suivants :
        1. Encourager les échanges entre pairs, à travers le partage d'expériences et d'informations ;
        2. Renforcer les IFCL, par la mise à disposition de ressources documentaires, de formations et d'expertise technique ;
        3. Porter le plaidoyer en faveur des IFCL, en étant une force de proposition et de représentation aux niveaux local, national et international auprès des acteurs de la décentralisation.

        Conformément aux activités menées par le RIAFCO, et dans le cadre de l'Atelier de Dakar, nous réaffirmons la nécessité d'un soutien continu et différencié aux IFCL afin de leur permettre de déployer leur assise institutionnelle, de disposer des moyens humains, techniques et d'ingénierie nécessaires et suffisants pour assurer leur mandat, de diversifier leurs sources de financement, et d'élargir leurs gammes de services financiers et techniques apportés aux gouvernements locaux.

        Nous appelons donc à un soutien renforcé aux activités du RIAFCO et de ses membres, visant à :
        - Contribuer à faciliter la mobilisation des investissements locaux et au renforcement des collectivités territoriales à travers la canalisation des dotations des États et des partenaires, la mise en place de lignes de crédit, de garantie, et autres produits financiers adéquats, l’appui technique à la planification/programmation, la gestion financière et le renforcement des capacités ;
        - Rendre disponibles les informations agrégées et/ou actualisées sur les collectivités territoriales et le financement de la décentralisation ;
        - Produire une base de données sur l'état des lieux des IFCL dans les différents pays d'Afrique, avec des comparatifs sur les modèles les plus avancés, les facteurs de succès, les leçons apprises ;
        - Participer à la reconnaissance nationale et internationale des IFCL, en vue d’une action concertée dans le cadre des dialogues nationaux sur le financement et les instruments de la décentralisation effective et du développement local inclusif, la recherche de complémentarité et de cohérence dans les interventions des parties prenantes ;
        - Favoriser la coopération technique et institutionnelle entre pairs accompagnée d'un travail de soutien aux échanges entre les ministères de tutelle qui ont soutenu le développement de l'IFCL dans leur pays ;
        - Favoriser la mobilisation d'ingénierie et d'expertise à travers l’organisation d’un répertoire d’experts et une meilleure connexion avec les centres et espaces nationaux et régionaux de formation ;
        - Rechercher conjointement des financements via les coopérations sous régionales (zones économiques) ou par le biais de programmes définis par le RIAFCO.

        Nous mandons ici le RIAFCO pour assurer l'application des axes de la présente Feuille de Route pour l'Action, en collaboration avec les membres et observateurs des IFCL, et les collectivités locales qu'il sert, et ce en étroite coordination avec les ministères de tutelle, et les partenaires de développement actifs sur le continent africain.

        Fait à Dakar - Sénégal, le 30 mars 2018
      `,
            content_en: `
        **"Infranational Financial Intermediation: A Sustainable Future for Local Investment"**

        We, Local Government Financing Institutions (LGFIs), from ten African countries, gathered in the framework of the Exchange, Restitution, and Strategic Dialogue Workshop of the Network of African Local Government Financing Institutions (RIAFCO) held on March 29th and 30th 2018 in Dakar, Senegal:

        Considering the crucial role of local and regional governments in the implementation of recent major international agreements (New Urban Agenda, Sustainable Development Goals/2030 Agenda, Paris Agreement, Addis Ababa Action Agenda on Development Finance – in particular through Article 34), and as reaffirmed in the African Charter of values and principles of decentralization, local governance and local development (2014);

        On the basis of the role of local and regional governments as prime partners of central Governments, in support of inclusive economic development of territories, and the production of sustainable services and infrastructure for citizens;

        Welcome with interest the inclusion of localization, hybridization and diversification of local and regional authorities’ funding sources at the heart of concerns (priorities) for development actors and an ever-growing number of central governments;

        Hereby acknowledge the enactment of the unwavering will of national governments to create or reinforce Local Government Financing Institutions, enshrined for the first time in a United Nations text – in this case, the New Urban Agenda, acted in Quito in October 2016, during the Habitat III Conference (Art.139).

        Through our interactions, we thus reaffirm the role of LGFIs:
        - As catalyzers for national and international, public, institutional and private financing towards territories and local sustainable, resilient, low-carbon, and inclusive development, enabling the reduction of infrastructure and core services deficit;
        - As mechanisms for resource mobilization and allocation, through the implementation of appropriate financial instruments, technical and financial engineering assistance for local authorities, and the follow-up and evaluation of the efficient use of funds;
        - In the creation and the development of local loan markets, as key elements in the diversification of local governments’ resources, in the increase of investment volumes, in the reinforcement of their abilities to act and their autonomy, and for innovation.

        Recalling that to serve the purpose of mutual reinforcement, African LGFIs have joined together, as of 2014, to form RIAFCO, a network with objectives as follow:
        1. Encourage peer exchange, through the sharing of experience and information;
        2. Reinforce LGFAs, through the provision of documentary resources, trainings and technical expertise;
        3. Advocate in favor of LGFAs, by spearheading proposals and representing LGFAs’ interests at the local, national and international levels with decentralization actors.

        In keeping with activities conducted by RIAFCO, and in the framework of the Dakar Workshop, we reaffirm the need for continuous and differentiated support towards LGFIs in order to enable them to deploy their institutional foundation, to possess necessary and sufficient human, technical and engineering means to carry out their mandate, diversify their financial sources, and expand ranges of financial and technical services intended for local authorities.

        We, henceforth, call for reinforced support to RIAFCO activities and its members, with aims to:
        - Contribute to the facilitation of local investments and the strengthening of local authorities through the channeling of Government and partner funds, the implementation of credit facilities, collaterals, and other adequate financial products, technical support in planning/programming, financial management and capacity building;
        - Make aggregated and/or updated information on local authorities and decentralization financing available;
        - Produce a database on the state of LGFIs in African countries, including an advanced model benchmark, success factors, and lessons learned;
        - Participate to the national and global recognition of LGFIs, in view of concerted action in the framework of national dialogues on instruments and financing of effective decentralization and inclusive local development, the search for complementarity and coherence in stakeholder participation;
        - Foster peer-driven technical and institutional cooperation accompanied by support towards exchange between line ministries that have worked towards the development of LGFIs in their country;
        - Foster engineering capabilities and expertise through the creation of an expert pool, and better linking with national and regional training facilities;
        - Jointly identify financing through sub-regional cooperation (economic zones) or through programs as defined by RIAFCO.

        We hereby mandate RIAFCO to ensure the application of the axes of the present Roadmap for Action, in collaboration with LGFI members and observers, and the local authorities it serves, and this in close coordination with line ministries, and development partners active on the African continent.

        Done at Dakar - Senegal, March 30th 2018
      `,
            image: "", // Vous pouvez ajouter une URL d'image si vous en avez une
            status: "PUBLISHED",
            publishedAt: new Date("2018-03-30"), // Date de la signature de la feuille de route
            authorId: "default-author-id", // Remplacez par un ID d'utilisateur valide dans votre base de données
        },
    });


    console.log("Seed pour News (Visite d'étude et de coopération) terminé avec succès.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
