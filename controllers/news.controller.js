const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const emailService = require("../services/email.service");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// module.exports.getAllNews = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       status,
//       search,
//       author,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//     } = req.query;

//     const skip = (page - 1) * limit;
//     const take = Number.parseInt(limit);

//     const where = {};
//     if (status) where.status = status;
//     if (author) where.authorId = author;
//     if (search) {
//       where.OR = [
//         { title: { contains: search, mode: "insensitive" } },
//         { content: { contains: search, mode: "insensitive" } },
//       ];
//     }

//     const [news, total] = await Promise.all([
//       prisma.news.findMany({
//         where,
//         include: {
//           author: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               profilePic: true,
//             },
//           },
//           _count: {
//             select: {
//               campaigns: true, 
//             },
//           },
//         },
//         skip,
//         take,
//         orderBy: { [sortBy]: sortOrder },
//       }),
//       prisma.news.count({ where }),
//     ]);

//     res.status(200).json({
//       news,
//       pagination: {
//         page: Number.parseInt(page),
//         limit: take,
//         total,
//         pages: Math.ceil(total / take),
//       },
//     });
//   } catch (error) {
//     console.error("Get all news error:", error);
//     res.status(500).json({
//       message: "Failed to retrieve news",
//       code: "GET_NEWS_ERROR",
//     });
//   }
// };

module.exports.getAllNews = async (req, res) => {
  try {
    // Extraire et valider les paramètres de la requête
    const {
      page = 1,
      limit = 12,
      status,
      search = "",
      authorId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Calculer la pagination
    const currentPage = Number.parseInt(page) || 1;
    const pageSize = Number.parseInt(limit) || 12;
    const skip = (currentPage - 1) * pageSize;
    const take = pageSize;

    // Construire la clause WHERE pour le filtrage
    const where = {};

    // Filtre par statut
    if (status) {
      where.status = status;
    }

    // Filtre par auteur
    if (authorId) {
      where.authorId = authorId;
    }

    // Filtre par plage de dates
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
        // Ajouter 1 jour pour inclure toute la journée
        where.createdAt.lte.setDate(where.createdAt.lte.getDate() + 1);
      }
    }

    // Recherche dans les titres et contenus (français et anglais)
    if (search) {
      where.OR = [
        { title_fr: { contains: search, mode: "insensitive" } },
        { title_en: { contains: search, mode: "insensitive" } },
        { content_fr: { contains: search, mode: "insensitive" } },
        { content_en: { contains: search, mode: "insensitive" } },
      ];
    }

    // Déterminer l'ordre de tri
    const orderBy = {};
    if (sortBy) {
      // Gérer les cas spéciaux
      if (sortBy === "name") {
        // Tri par titre (priorité au français)
        orderBy = [
          { title_fr: sortOrder },
          { title_en: sortOrder }
        ];
      } else if (sortBy === "author") {
        // Tri par nom d'auteur
        orderBy = {
          author: {
            lastName: sortOrder,
          },
        };
      } else if (sortBy === "publishedAt") {
        // Tri par date de publication (les non-publiés en dernier)
        orderBy = [
          { publishedAt: sortOrder === "asc" ? "asc" : "desc" },
          { publishedAt: null }
        ];
      } else {
        // Tri standard
        orderBy[sortBy] = sortOrder;
      }
    } else {
      // Tri par défaut: plus récentes d'abord
      orderBy.createdAt = "desc";
    }

    // Récupérer les news avec pagination et les données associées
    const [newsItems, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
        skip,
        take,
        orderBy,
      }),

      // Compter le total d'éléments correspondant aux critères
      prisma.news.count({ where }),
    ]);

    // Formater les résultats pour l'API
    const formattedNews = newsItems.map(news => ({
      ...news,
      // Ajouter des champs calculés pour faciliter l'affichage
      formattedCreatedAt: news.createdAt.toLocaleString('fr-FR'),
      formattedPublishedAt: news.publishedAt ? news.publishedAt.toLocaleString('fr-FR') : null,
      // Extraire le contenu textuel pour les aperçus
      contentPreview_fr: news.content_fr ? news.content_fr.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
      contentPreview_en: news.content_en ? news.content_en.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
    }));

    // Préparer la réponse
    res.status(200).json({
      success: true,
      news: formattedNews,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
        hasNextPage: (currentPage * pageSize) < total,
        hasPrevPage: currentPage > 1,
      },
      filters: {
        search,
        status,
        authorId,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des news:", error);

    // En développement, retourner plus de détails sur l'erreur
    const errorResponse = {
      success: false,
      message: "Échec de la récupération des news",
      code: "GET_NEWS_ERROR",
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
  }
};
module.exports.getNewsItem = async (req, res) => {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        campaigns: {
          select: {
            id: true,
            subject: true,
            sentAt: true,
            recipientCount: true,
            status: true,
          },
        },

        _count: {
            select: {
              campaigns: true,
            },
          },
      },
    });

    if (!newsItem) {
      return res.status(404).json({
        message: "News item not found",
        code: "NEWS_NOT_FOUND",
      });
    }

    res.status(200).json({ news: newsItem });
  } catch (error) {
    console.error("Get news item error:", error);
    res.status(500).json({
      message: "Failed to retrieve news item",
      code: "GET_NEWS_ITEM_ERROR",
    });
  }
};

module.exports.createNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      title_fr,
      title_en,
      content_fr,
      content_en,
      status = "DRAFT",
      publishedAt,
      scheduleNewsletter = false,
    } = req.body;
    const authorId = res.locals.user.id;

    let imagePath = null;
    if (req.file) {
       imagePath = `/news/${req.file.filename}`;
     }

    const newsData = {
      title_fr: title_fr.trim(),
      title_en: title_en.trim(),
      content_fr: content_fr.trim(),
      content_en: content_en.trim(),
      image: imagePath,
      status,
      authorId,
    };

    if (publishedAt) {
      newsData.publishedAt = new Date(publishedAt);
    } else if (status === "PUBLISHED") {
      newsData.publishedAt = new Date();
    }

    const news = await prisma.news.create({
      data: newsData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    // Schedule newsletter if requested
    if (scheduleNewsletter && status === "PUBLISHED") {
      try {
        await this.sendNewsletterForNews(news.id);
      } catch (newsletterError) {
        console.error("Failed to send newsletter:", newsletterError);
        // Don't fail news creation if newsletter fails
      }
    }

    await createAuditLog({
      userId: authorId,
      action: "NEWS_CREATED",
      resource: "news",
      resourceId: news.id,
      details: { title: news.title, status, scheduleNewsletter },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "News created successfully",
      news,
    });
  } catch (error) {
    console.error("Create news error:", error);
    res.status(500).json({
      message: "Failed to create news",
      code: "CREATE_NEWS_ERROR",
    });
  }
};

module.exports.updateNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { title_fr, title_en, content_fr , content_en, status, publishedAt   } = req.body;

    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return res.status(404).json({
        message: "News item not found",
        code: "NEWS_NOT_FOUND",
      });
    }

    const updateData = {
     title_fr: title_fr.trim(),
      title_en: title_en.trim(),
      content_fr: content_fr.trim(),
      content_en: content_en.trim(),
      status,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (publishedAt) {
      updateData.publishedAt = new Date(publishedAt);
    } else if (status === "PUBLISHED" && existingNews.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    if (req.file) {
       updateData.image = `/news/${req.file.filename}`;
    }
    
    const updatedNews = await prisma.news.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "NEWS_UPDATED",
      resource: "news",
      resourceId: id,
      details: { changes: updateData },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "News updated successfully",
      news: updatedNews,
    });
  } catch (error) {
    console.error("Update news error:", error);
    res.status(500).json({
      message: "Failed to update news",
      code: "UPDATE_NEWS_ERROR",
    });
  }
};

module.exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return res.status(404).json({
        message: "News item not found",
        code: "NEWS_NOT_FOUND",
      });
    }

    const campagnes = await prisma.newsletterCampaign.findMany({
      where: { newsId: id },
    });
    
    if (campagnes.length > 0) {
      // delete campagnes
      await prisma.newsletterCampaign.deleteMany({
        where: { newsId: id },
      })
    }

    await prisma.news.delete({
      where: { id },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "NEWS_DELETED",
      resource: "news",
      resourceId: id,
      details: { title: existingNews.title },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "News deleted successfully",
    });
  } catch (error) {
    console.error("Delete news error:", error);
    res.status(500).json({
      message: "Failed to delete news",
      code: "DELETE_NEWS_ERROR",
    });
  }
};


// all campagne for newsletter

module.exports.getCampaignsByNews = async (req, res) => {
  try {
    const { id: newsId } = req.params;
    const { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    console.log(req.params)

    if (!newsId) {
        return res.status(400).json({
          message: "newsId is required in params",
          code: "NEWS_ID_REQUIRED"
        });
     }
    

    const news = await prisma.news.findUnique({
      where: { id: newsId }
    })
    if (!news) {
      return res.status(404).json({
        message: "News not found",
        code: "NEWS_NOT_FOUND",
      });
    }

    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);

    const where = { newsId };
    if (status) where.status = status;

    

    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          news: {
            select: {
              id: true, title_en: true, title_fr: true, content_en: true, content_fr: true, image: true, authorId: true, publishedAt: true,
              author: { select: { firstName:true, lastName: true } },
            },
          },
        },
      }),
      prisma.newsletterCampaign.count({ where }),
    ]);

    res.status(200).json({
      campaigns,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Get campaigns by news error:", error);
    res.status(500).json({
      message: "Failed to retrieve campaigns for this news",
      code: "GET_CAMPAIGNS_BY_NEWS_ERROR",
      error : error
    });
  }
};


/*--------------------------------------------------------------------------------------*/
module.exports.getAllCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const skip = (page - 1) * limit
    const take = Number.parseInt(limit)

    const where = {}
    if (status) where.status = status

    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        include: {
          news: {
            select: { id: true, title_fr: true, title_en: true, content_fr: true, content_en: true, image: true, authorId: true }
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.newsletterCampaign.count({ where }),
    ])

    res.status(200).json({
      campaigns,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    })
  } catch (error) {
    console.error("Get campaigns error:", error)
    res.status(500).json({ message: "Failed to retrieve campaigns", code: "GET_CAMPAIGNS_ERROR" })
  }
}


module.exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: req.params.id },
      include: {
        news: {
          select: { id: true, title_fr: true, title_en: true, content_fr: true, content_en: true, content: true, image: true ,   authorId: true , publishedAt: true  },
        },
      },
    })

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found", code: "CAMPAIGN_NOT_FOUND" })
    }

    res.status(200).json({ campaign })
  } catch (error) {
    console.error("Get campaign error:", error)
    res.status(500).json({ message: "Failed to retrieve campaign", code: "GET_CAMPAIGN_ERROR" })
  }
}


module.exports.createCampaign = async (req, res) => {
  try {
    const { subject, content, htmlContent, newsId, scheduledAt } = req.body

    const news = await prisma.news.findUnique({
      where: { id: newsId },
    })
    
    if (!news) {
      return res.status(404).json({ message: "News not found", code: "NEWS_NOT_FOUND" })
    }

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject,
        content,
        htmlContent,
        newsId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: "DRAFT",
      },
    })
     await createAuditLog({
      userId: res.locals.user.id,
      action: "CAMPAIGN_CREATED",
      resource: "campaign",
      resourceId: campaign.id,
      details: { subject : campaign.subject, status: campaign.status },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
     });
    
    res.status(201).json({ message: "Campaign created successfully", campaign })
  } catch (error) {
    console.error("Create campaign error:", error)
    res.status(500).json({ message: "Failed to create campaign", code: "CREATE_CAMPAIGN_ERROR" })
  }
}

module.exports.updateCampaign = async (req, res) => {
  const userId = res.locals.user?.id || req.user?.id || null;
  console.log(userId);
  try {
    const { id } = req.params
    const { subject, content, status, scheduledAt } = req.body

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found", code: "CAMPAIGN_NOT_FOUND" })
    }

    const updatedCampaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        subject,
        content,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    })

     await createAuditLog({
      userId: res.locals.user.id,
      action: "CAMPAIGN_UPDATED",
      resource: "campaign",
      resourceId: updatedCampaign.id,
      details: { subject : updatedCampaign.subject, status: updatedCampaign.status },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
     });
    res.status(200).json({ message: "Campaign updated successfully", campaign: updatedCampaign })
  } catch (error) {
    console.error("Update campaign error:", error)
    res.status(500).json({
      message: "Failed to update campaign",
      code: "UPDATE_CAMPAIGN_ERROR",
      error: error.message
    })
  }
}


module.exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found", code: "CAMPAIGN_NOT_FOUND" })
    }

    await prisma.newsletterCampaign.delete({
      where: { id },
    })
     await createAuditLog({
        userId: res.locals.user.id,
        action: "CAMPAIGN_DELETED",
        resource: "campaign",
        resourceId: campaign.id,
        details: { subject : campaign.subject, status: campaign.status },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
     });
    res.status(200).json({ message: "Campaign deleted successfully" })
  } catch (error) {
    console.error("Delete campaign error:", error)
    res.status(500).json({ message: "Failed to delete campaign", code: "DELETE_CAMPAIGN_ERROR" })
  }
}


module.exports.sendNewsletterForNews = async (newsId) => {
  try {
      const news = await prisma.news.findUnique({
        where: { id: newsId },
        include: {
          author: {
            select: { firstName: true, lastName: true },
          },
          subscribers: {
            where: { status: "ACTIVE" }, // uniquement abonnés actifs
            select: { email: true },
          },
        },
    });

    if (!news) {
      throw new Error("News item not found");
    }

    const subscribers = prisma

    if (subscribers.length === 0) {
      console.log("No active subscribers found");
      return;
    }

    const newsletter = {
      subject: `RIAFCO News: ${news.title}`,
      content: news.content,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>${news.title}</h1>
          ${
            news.image
              ? `<img src="${process.env.BACKEND_URL}${news.image}" alt="${news.title}" style="max-width: 100%; height: auto;">`
              : ""
          }
          <div>${news.content}</div>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Published by ${news.author.firstName} ${news.author.lastName}<br>
            RIAFCO Newsletter
          </p>
        </div>
      `,
    };

    await emailService.sendNewsletterEmail(subscribers, newsletter);

    // Create newsletter campaign record
     await prisma.newsletterCampaign.create({
      data: {
        newsId,
        subject: newsletter.subject,
        content: newsletter.content,
        htmlContent: newsletter.htmlContent,
        status: "SENT",
        sentAt: new Date(),
        recipientCount: subscribers.length,
      },
     });
    console.log(`Newsletter sent to ${subscribers.length} subscribers`);
  } catch (error) {
    console.error("Send newsletter error:", error);
    throw error;
  }
};
