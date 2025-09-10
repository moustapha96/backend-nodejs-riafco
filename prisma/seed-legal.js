const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();


async function main() {
  // Supprimer les données existantes pour éviter les doublons
  await prisma.legalMention.deleteMany({});

  // Créer les mentions légales
  await prisma.legalMention.createMany({
    data: [
      {
        type: "TERMS_OF_SERVICE",
        title_fr: "Mentions Légales - Conditions d'Utilisation",
        title_en: "Legal Notice - Terms of Use",
        content_fr: `
          **Propriété du site**
          Le domaine www.riafco.org appartient au Réseau des Institutions de Financement des Collectivités Locales (RIAFCO), organisation non gouvernementale de droit camerounais, sise au BP 718 – Santabarbara, Yaoundé, Cameroun.

          Merci de lire attentivement les présentes modalités d’utilisation du site internet avant de le parcourir. En vous connectant sur ce site, vous acceptez toutes les présentes modalités.

          **CONDITIONS D’UTILISATION**
          Le site accessible par l’URL suivante : www.riafco.org est exploité dans le respect de la législation camerounaise. L'utilisation de ce site est régie par les présentes conditions générales. En utilisant le site, vous reconnaissez avoir pris connaissance de ces conditions et les avoir acceptées. Celles-ci pourront être modifiées à tout moment et sans préavis par le RIAFCO.

          Attention : riafco.org ne saurait être tenu pour responsable en aucune manière d’une mauvaise utilisation du service.

          **PROPRIÉTÉS**
          Le logo du RIAFCO ne peut pas être recréé ou altéré de sa forme originale. Si vous voulez une copie du logo RIAFCO, veuillez contacter : riafco@gmail.com

          Toute reproduction, copie, utilisation, distribution, commercialisation des informations contenues et produites dans ces pages web, et qui se feraient sans l’autorisation du RIAFCO, est une infraction punie par la législation en vigueur.

          **LIMITATION DE RESPONSABILITÉS**
          Les informations contenues sur ce site sont aussi précises que possible, et le site est périodiquement mis à jour. Si vous constatez des lacunes, des erreurs, ou ce qui paraît être un dysfonctionnement, merci de bien vouloir contacter nos équipes (riafco@gmail.com) en décrivant le problème de la manière la plus précise possible.

          Tout contenu téléchargé incombe à l’utilisateur et sous sa seule responsabilité. En conséquence, riafco.org ne saurait être tenu responsable d’un quelconque dommage subi par l’ordinateur de l’utilisateur ou d’une quelconque perte de données consécutives au téléchargement.

          **LIENS HYPERTEXTES**
          Le site internet peut offrir des liens vers d’autres sites ou d’autres ressources disponibles sur internet. riafco.org ne dispose d’aucun moyen pour contrôler ces sites internet. Le RIAFCO ne répond pas de la disponibilité de tels sites ou sources externes, ni ne le garantit.

          Le RIAFCO ne peut être tenu responsable de tout dommage, de quelque nature que ce soit, résultant du contenu de ces sites ou sources externes, notamment des informations, produits ou services qu’ils proposent, ou de tout usage qui peut être fait de ces éléments. Les risques liés à cette utilisation incombent à l’internaute qui doit se conformer à leurs conditions d’utilisation.

          Les liens hypertextes mis en place dans le cadre du présent site internet en direction d’autres ressources et sites internet ne sauraient engager la responsabilité de riafco.org.

          **LITIGES**
          Les présentes conditions sont régies par les lois camerounaises et toute contestation ou litiges qui pourraient naître de l’interprétation ou de l’exécution de celles-ci seront de la compétence exclusive des tribunaux dont dépend le siège social du RIAFCO. La langue de référence pour le règlement de contentieux éventuels est le français.

          **CONDITIONS DE SERVICE**
          Ce site est proposé en langage C#.NET pour un meilleur confort d’utilisation, nous vous recommandons de recourir aux dernières versions des navigateurs internet que vous utilisez.

          **INFORMATIONS ET EXCLUSION**
          riafco.org met en œuvre tous les moyens dont il dispose, pour assurer une information fiable, et une mise à jour de son site internet. Toutefois, des erreurs ou omissions peuvent survenir. Dans ces cas, l’internaute devra s’assurer de l’exactitude des informations auprès de riafco.org, et signaler toutes modifications du site qu’il jugerait utile. riafco.org n’est en aucun cas responsable de l’utilisation faite de ces informations, et de tout préjudice direct ou indirect pouvant en découler.

          **PROTECTION DES DONNÉES**
          riafco.org n’exige aucune communication par les utilisateurs de données personnelles. Toutefois, dans le cas où vous souhaitez nous contacter pour obtenir certaines informations, ou recevoir des documents, vous pouvez être amenés à nous fournir certaines données personnelles.

          riafco.org vous informe que ces données personnelles sont destinées à son seul usage, et qu’il est responsable de leur traitement et conservation. Ces données ne seront pas communiquées à un tiers à l’exception de tiers intervenant dans son contenu et sa gestion. Ces tiers sont tenus de respecter la confidentialité de ces données et ne peuvent en aucun cas les utiliser dans un but autre que le fonctionnement ou la gestion du site.

          riafco.org s’engage à prendre toutes mesures raisonnables à sa disposition pour préserver la confidentialité de vos données.

          Pour rappel, et conformément à la loi relative à l’informatique, aux fichiers et aux libertés, vous disposez d’un droit d’opposition, d’accès et de rectification de ces données personnelles. Vous pouvez exercer ce droit à tout moment en adressant un courrier à :
          Secrétariat Permanent du RIAFCO
          BP 718 - Santabarbara
          Yaoundé, Cameroun
          Ou par E-mail : riafco@gmail.com
        `,
        content_en: `
          **Ownership of the Site**
          The domain www.riafco.org belongs to the Network of African Financial Institutions for Local Governments (RIAFCO), a non-governmental organization under Cameroun law, located at BP 718 – Santabarbara, Yaoundé, Cameroun.

          Please read these Terms of Use carefully before browsing. By accessing this site, you accept all of these terms and conditions.

          **TERMS OF USE**
          The website is accessible via the following URL: www.riafco.org which is operated in compliance with Cameroun’s legislation. The use of this site is governed by the present general conditions. By using the Site, you acknowledge that you have read and accept these Terms and Conditions. These can be modified at any time and without prior notice by the Network of African Financial Institutions for Local Governments (RIAFCO).

          Warning: riafco.org cannot be held responsible in any way for any misuse of the service.

          **PROPERTIES**
          The RIAFCO logo cannot be reproduced or altered from its original form. If you would like a copy of the RIAFCO logo, please contact: riafco@gmail.com

          Any reproduction, copy, use, distribution, marketing of the information contained and produced in these web pages performed without the authorization of the RIAFCO is an offense punishable by the legislation in force.

          **LIMITATION OF LIABILITY**
          The information contained on this site is as accurate as possible, and the website is periodically updated. If you notice any shortcomings, errors, or what appears to be a malfunction, please kindly contact our teams (riafco@gmail.com) by describing the problem as accurately as possible.

          All downloaded content is the sole responsibility of the user. As a result, riafco.org cannot be held responsible for any damage suffered by the user's computer or any loss of data resulting from the download.

          **HYPERTEXT LINKS**
          The website may offer links to other sites or other resources available on the internet. riafco.org has no way to control these websites. The RIAFCO is not responsible for and does not guarantee the availability of such sites or external sources. The RIAFCO cannot be held liable for any damages of any kind resulting from the content of these sites or external sources, including the information, products or services they offer, or for any use that may be made of them. The risks associated with this use are incumbent on the Internet user who must comply with their conditions of use.

          The hypertext links set up in the framework of this website towards other resources and websites do not incur the liability of riafco.org.

          **LITIGATION**
          These terms and conditions are governed by the laws of Cameroon and any disputes or litigation potentially arising out of the interpretation or execution thereof shall be the exclusive jurisdiction of the courts on which the registered office of the RIAFCO depends. The language of reference for the settlement of any eventual disputes is French.

          **CONDITIONS OF SERVICE**
          This site is offered in C# .NET language for better ease of use. We recommend you use the latest versions of the web browsers of your choice.

          **INFORMATION AND EXCLUSION**
          riafco.org uses all the means at its disposal to ensure reliable information and to update its website. However, errors or omissions may occur. In these cases, users must ensure that riafco.org information is accurate, and report any changes to the site that they deem useful. riafco.org is in no way responsible for the use made of this information, and for any direct or indirect damage that may result.

          **DATA PROTECTION**
          riafco.org does not require any communication of personal data by users. However, in the event that you wish to contact us to obtain certain information or to receive documents, you may be required to provide us with certain personal data.

          riafco.org informs you that these personal data are intended for its sole use and that it is responsible for their processing and storage. These data will not be communicated to a third party except for third parties involved in their content and management. These third parties are obliged to respect the confidentiality of your data and may in no case use them for any purpose other than the operation or management of the site.

          riafco.org is committed to taking all reasonable steps at its disposal to preserve the confidentiality of your data.

          As a reminder, and in accordance with the Cameroon’s law relating to data processing, files and freedoms, you have a right to opposition, access and rectification of this personal data. You may exercise this right at any time by sending a letter to:
          Secrétariat Permanent du RIAFCO
          BP 718 - Santabarbara
          Yaoundé, Cameroun
          Or by E-mail: riafco@gmail.com
        `,
        isActive: true,
        version: "1.0",
        effectiveDate: new Date("2023-01-01"), // Date d'entrée en vigueur
      },
    ],
  });

  console.log("Seed pour LegalMention terminé avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
