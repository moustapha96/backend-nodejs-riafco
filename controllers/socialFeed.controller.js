const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

/**
 * @desc Get all social feeds
 * @route GET /api/social-feeds
 * @access Public (ou Private selon tes besoins)
 */
module.exports.getAllSocialFeeds = async (req, res) => {
  try {
    const { page = 1, limit = 20, platform, sortBy = "publishedAt", sortOrder = "desc" } = req.query;
    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);

    const where = {};
    if (platform) {
      where.platform = platform;
    }

    const [feeds, total] = await Promise.all([
      prisma.socialFeed.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.socialFeed.count({ where }),
    ]);

    res.status(200).json({
      feeds,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Get all social feeds error:", error);
    res.status(500).json({
      message: "Failed to retrieve social feeds",
      code: "GET_SOCIAL_FEEDS_ERROR",
    });
  }
};

/**
 * @desc Get social feed by ID
 * @route GET /api/social-feeds/:id
 * @access Public (ou Private selon tes besoins)
 */
module.exports.getSocialFeedById = async (req, res) => {
  try {
    const { id } = req.params;
    const feed = await prisma.socialFeed.findUnique({
      where: { id },
    });

    if (!feed) {
      return res.status(404).json({
        message: "Social feed not found",
        code: "SOCIAL_FEED_NOT_FOUND",
      });
    }

    res.status(200).json({ feed });
  } catch (error) {
    console.error("Get social feed by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve social feed",
      code: "GET_SOCIAL_FEED_ERROR",
    });
  }
};

/**
 * @desc Create a new social feed
 * @route POST /api/social-feeds
 * @access Private (ADMIN, MODERATOR)
 */
module.exports.createSocialFeed = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { platform, postId, content, postUrl, author, publishedAt } = req.body;

    // Vérifier si le postId existe déjà pour la même plateforme
    const existingFeed = await prisma.socialFeed.findFirst({
      where: {
        platform,
        postId,
      },
    });

    if (existingFeed) {
      return res.status(400).json({
        message: "Social feed with this post ID already exists for the platform",
        code: "SOCIAL_FEED_POST_ID_EXISTS",
      });
    }

    const feed = await prisma.socialFeed.create({
      data: {
        platform,
        postId,
        content,
        postUrl,
        author,
        publishedAt: new Date(publishedAt),
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "SOCIAL_FEED_CREATED",
      resource: "social_feeds",
      resourceId: feed.id,
      details: {
        platform: feed.platform,
        postId: feed.postId,
        createdBy: res.locals.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "Social feed created successfully",
      feed,
    });
  } catch (error) {
    console.error("Create social feed error:", error);
    res.status(500).json({
      message: "Failed to create social feed",
      code: "CREATE_SOCIAL_FEED_ERROR",
    });
  }
};

/**
 * @desc Update a social feed
 * @route PUT /api/social-feeds/:id
 * @access Private (ADMIN, MODERATOR)
 */
module.exports.updateSocialFeed = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { content, postUrl, author, publishedAt } = req.body;

    const existingFeed = await prisma.socialFeed.findUnique({
      where: { id },
    });

    if (!existingFeed) {
      return res.status(404).json({
        message: "Social feed not found",
        code: "SOCIAL_FEED_NOT_FOUND",
      });
    }

    const updateData = {
      content,
      postUrl,
      author,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    };

    // Supprimer les champs non définis
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedFeed = await prisma.socialFeed.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "SOCIAL_FEED_UPDATED",
      resource: "social_feeds",
      resourceId: id,
      details: {
        changes: updateData,
        updatedBy: res.locals.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Social feed updated successfully",
      feed: updatedFeed,
    });
  } catch (error) {
    console.error("Update social feed error:", error);
    res.status(500).json({
      message: "Failed to update social feed",
      code: "UPDATE_SOCIAL_FEED_ERROR",
    });
  }
};

/**
 * @desc Delete a social feed
 * @route DELETE /api/social-feeds/:id
 * @access Private (ADMIN)
 */
module.exports.deleteSocialFeed = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFeed = await prisma.socialFeed.findUnique({
      where: { id },
    });

    if (!existingFeed) {
      return res.status(404).json({
        message: "Social feed not found",
        code: "SOCIAL_FEED_NOT_FOUND",
      });
    }

    await prisma.socialFeed.delete({
      where: { id },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "SOCIAL_FEED_DELETED",
      resource: "social_feeds",
      resourceId: id,
      details: {
        deletedFeed: existingFeed.postId,
        platform: existingFeed.platform,
        deletedBy: res.locals.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Social feed deleted successfully",
    });
  } catch (error) {
    console.error("Delete social feed error:", error);
    res.status(500).json({
      message: "Failed to delete social feed",
      code: "DELETE_SOCIAL_FEED_ERROR",
    });
  }
};
