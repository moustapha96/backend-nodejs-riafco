// controllers/discussion.controller.js
const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

/**
 * @desc Get all discussions
 * @route GET /api/discussions
 * @access Public
 */
module.exports.getAllDiscussions = async (req, res) => {
  try {
    const { themeId } = req.query;
    const where = themeId ? { themeId } : {};

    const discussions = await prisma.discussion.findMany({
      where,
      include: {
        theme: { select: { title: true, slug: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ discussions });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve discussions", error: error.message });
  }
};


module.exports.getAllDiscussionsTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const where = id ? { themeId: id } : {};

    const discussions = await prisma.discussion.findMany({
      where,
      include: {
        theme: { select: { title: true, slug: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ discussions });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve discussions", error: error.message });
  }
};

/**
 * @desc Create a discussion
 * @route POST /api/discussions
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
module.exports.createDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, themeId } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const discussion = await prisma.discussion.create({
      data: {
        title,
        slug,
        content,
        themeId,
        createdById: res.locals.user.id,
      },
      include: {
        theme: { select: { title: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "DISCUSSION_CREATED",
      resource: "discussions",
      resourceId: discussion.id,
      details: { title: discussion.title, theme: discussion.theme.title },
    });

    res.status(201).json({ discussion });
  } catch (error) {
    res.status(500).json({ message: "Failed to create discussion", error: error.message });
  }
};

/**
 * @desc Create a comment
 * @route POST /api/discussions/:discussionId/comments
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
module.exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { discussionId } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        discussionId,
        createdById: res.locals.user.id,
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "COMMENT_CREATED",
      resource: "comments",
      resourceId: comment.id,
      details: { discussionId, content: comment.content.substring(0, 50) },
    });

    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ message: "Failed to create comment", error: error.message });
  }
};



/**
 * @desc Get discussions with their comments
 * @route GET /api/discussions/with-comments
 * @access Public
 */
module.exports.getDiscussionsWithComments = async (req, res) => {
  try {
    const { id } = req.params;
    const where = id ? { themeId: id } : {};

    const discussions = await prisma.discussion.findMany({
      where,
      include: {
        theme: { select: { id: true, title: true, slug: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        comments: {
          include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: "asc" }, // commentaires dans l'ordre chronologique
        },
      },
      orderBy: { createdAt: "desc" }, // discussions les + récentes d'abord
    });

    res.status(200).json({ success: true, data: discussions });
  } catch (error) {
    console.error("Get discussions with comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussions with comments",
      error: error.message,
    });
  }
};

