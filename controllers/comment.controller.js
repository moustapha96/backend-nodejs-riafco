const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { logAudit } = require("../utils/audit");
const prisma = new PrismaClient();

/**
 * @desc Get all comments for a discussion
 * @route GET /api/discussions/:discussionId/comments
 * @access Public
 */
const getAllComments = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { discussionId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ success: false, message: "Error fetching comments", error: error.message });
  }
};

/**
 * @desc Create a new comment
 * @route POST /api/discussions/:discussionId/comments
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { discussionId } = req.params;
    const { content } = req.body;

    // Vérifier si la discussion existe
    const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        discussionId,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    await logAudit(
      req.user.id,
      "CREATE",
      "Comment",
      comment.id,
      { discussionId, content: content.substring(0, 50) },
      req.ip,
      req.get("User-Agent")
    );

    res.status(201).json({ success: true, message: "Comment created successfully", data: comment });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ success: false, message: "Error creating comment", error: error.message });
  }
};

/**
 * @desc Update a comment
 * @route PUT /api/comments/:id
 * @access Private (Owner, ADMIN, MODERATOR)
 */
const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Vérifier si l'utilisateur est le propriétaire du commentaire ou un admin/moderator
    if (comment.createdById !== req.user.id && req.user.role !== "ADMIN" && req.user.role !== "MODERATOR") {
      return res.status(403).json({ success: false, message: "Not authorized to update this comment" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    await logAudit(
      req.user.id,
      "UPDATE",
      "Comment",
      id,
      { content: content.substring(0, 50) },
      req.ip,
      req.get("User-Agent")
    );

    res.json({ success: true, message: "Comment updated successfully", data: updatedComment });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ success: false, message: "Error updating comment", error: error.message });
  }
};

/**
 * @desc Delete a comment
 * @route DELETE /api/comments/:id
 * @access Private (Owner, ADMIN, MODERATOR)
 */
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Vérifier si l'utilisateur est le propriétaire du commentaire ou un admin/moderator
    if (comment.createdById !== req.user.id && req.user.role !== "ADMIN" && req.user.role !== "MODERATOR") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id } });

    await logAudit(
      req.user.id,
      "DELETE",
      "Comment",
      id,
      { content: comment.content.substring(0, 50) },
      req.ip,
      req.get("User-Agent")
    );

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "Error deleting comment", error: error.message });
  }
};

module.exports = {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
};
