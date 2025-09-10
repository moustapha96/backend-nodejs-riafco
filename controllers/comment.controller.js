

// const { PrismaClient } = require("@prisma/client")
// const { validationResult } = require("express-validator")
// const { logAudit } = require("../utils/audit")
// const prisma = new PrismaClient()

// /**
//  * @desc Get all comments for a discussion
//  * @route GET /api/discussions/:discussionId/comments
//  * @access Public
//  */
// const getAllComments = async (req, res) => {
//   try {
//     const { discussionId } = req.params
//     const comments = await prisma.comment.findMany({
//       where: { discussionId },
//       include: {
//         createdBy: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             profilePic: true,
//           },
//         },
//         replies: {
//           include: {
//             createdBy: {
//               select: { firstName: true, lastName: true, profilePic: true },
//             },
//           },
//         },
//       },
//       orderBy: { createdAt: "asc" },
//     })
//     res.json({ success: true, data: comments })
//   } catch (error) {
//     console.error("Get comments error:", error)
//     res.status(500).json({ success: false, message: "Error fetching comments", error: error.message })
//   }
// }

// /**
//  * @desc Create a new comment
//  * @route POST /api/discussions/:discussionId/comments
//  * @access Private (ADMIN, MODERATOR, MEMBER)
//  */
// const createComment = async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() })
//     }

//     const { discussionId } = req.params
//     const { content, parentId } = req.body

//     // Vérifier si la discussion existe
//     const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } })
//     if (!discussion) {
//       return res.status(404).json({ success: false, message: "Discussion not found" })
//     }

//     const comment = await prisma.comment.create({
//       data: {
//         content,
//         discussionId,
//         parentId,
//         createdById: res.locals.user.id,
//       },
//       include: {
//         createdBy: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             profilePic: true,
//           },
//         },
//         replies: {
//           include: {
//             createdBy: {
//               select: { firstName: true, lastName: true, profilePic: true },
//             },
//           },
//         },
//       },
//     })

//     await prisma.discussion.update({
//       where: { id: discussionId },
//       data: {
//         commentCount: { increment: 1 },
//         lastCommentAt: new Date(),
//       },
//     })

//     await logAudit(
//       res.locals.user.id,
//       "CREATE",
//       "Comment",
//       comment.id,
//       { discussionId, content: content.substring(0, 50) },
//       req.ip,
//       req.get("User-Agent"),
//     )

//     res.status(201).json({ success: true, message: "Comment created successfully", data: comment })
//   } catch (error) {
//     console.error("Create comment error:", error)
//     res.status(500).json({ success: false, message: "Error creating comment", error: error.message })
//   }
// }

// /**
//  * @desc Update a comment
//  * @route PUT /api/comments/:id
//  * @access Private (Owner, ADMIN, MODERATOR)
//  */
// const updateComment = async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() })
//     }

//     const { id } = req.params
//     const { content } = req.body

//     const comment = await prisma.comment.findUnique({ where: { id } })
//     if (!comment) {
//       return res.status(404).json({ success: false, message: "Comment not found" })
//     }

//     // Vérifier si l'utilisateur est le propriétaire du commentaire ou un admin/moderator
//     if (
//       comment.createdById !== res.locals.user.id &&
//       res.locals.user.role !== "ADMIN" &&
//       res.locals.user.role !== "MODERATOR"
//     ) {
//       return res.status(403).json({ success: false, message: "Not authorized to update this comment" })
//     }

//     const updatedComment = await prisma.comment.update({
//       where: { id },
//       data: { content },
//     })

//     await logAudit(
//       res.locals.user.id,
//       "UPDATE",
//       "Comment",
//       id,
//       { content: content.substring(0, 50) },
//       req.ip,
//       req.get("User-Agent"),
//     )

//     res.json({ success: true, message: "Comment updated successfully", data: updatedComment })
//   } catch (error) {
//     console.error("Update comment error:", error)
//     res.status(500).json({ success: false, message: "Error updating comment", error: error.message })
//   }
// }

// /**
//  * @desc Delete a comment
//  * @route DELETE /api/comments/:id
//  * @access Private (Owner, ADMIN, MODERATOR)
//  */
// const deleteComment = async (req, res) => {
//   try {
//     const { id } = req.params

//     const comment = await prisma.comment.findUnique({ where: { id } })
//     if (!comment) {
//       return res.status(404).json({ success: false, message: "Comment not found" })
//     }

//     // Vérifier si l'utilisateur est le propriétaire du commentaire ou un admin/moderator
//     if (
//       comment.createdById !== res.locals.user.id &&
//       res.locals.user.role !== "ADMIN" &&
//       res.locals.user.role !== "MODERATOR"
//     ) {
//       return res.status(403).json({ success: false, message: "Not authorized to delete this comment" })
//     }

//     await prisma.comment.delete({ where: { id } })

//     await logAudit(
//       res.locals.user.id,
//       "DELETE",
//       "Comment",
//       id,
//       { content: comment.content.substring(0, 50) },
//       req.ip,
//       req.get("User-Agent"),
//     )

//     res.json({ success: true, message: "Comment deleted successfully" })
//   } catch (error) {
//     console.error("Delete comment error:", error)
//     res.status(500).json({ success: false, message: "Error deleting comment", error: error.message })
//   }
// }

// module.exports = {
//   getAllComments,
//   createComment,
//   updateComment,
//   deleteComment,
// }

const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { createAuditLog } = require("../utils/audit")
const prisma = new PrismaClient()

/**
 * @desc Get all comments for a discussion
 * @route GET /api/discussions/:discussionId/comments
 * @access Public
 */
const getCommentsByDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params
    const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "asc" } = req.query

    const skip = (page - 1) * limit
    const orderBy = { [sortBy]: sortOrder }

    // Verify discussion exists
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          discussionId,
          parentId: null, // Only top-level comments
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
          replies: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePic: true,
                },
              },
              _count: {
                select: { likes: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy,
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.comment.count({
        where: {
          discussionId,
          parentId: null,
        },
      }),
    ])

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    })
  }
}

/**
 * @desc Get comment by ID
 * @route GET /api/comments/:id
 * @access Public
 */
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        discussion: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        replies: {
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
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    res.json({
      success: true,
      data: comment,
    })
  } catch (error) {
    console.error("Get comment error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching comment",
      error: error.message,
    })
  }
}

/**
 * @desc Create a new comment
 * @route POST /api/discussions/:discussionId/comments
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
const createComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { discussionId } = req.params
    const { content, parentId } = req.body

    // Verify discussion exists and is not locked
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    if (discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot comment on locked discussion",
      })
    }

    // If replying to a comment, verify parent exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment || parentComment.discussionId !== discussionId) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        })
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        discussionId,
        parentId,
        createdById: res.locals.user.id,
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
        replies: {
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
        },
        _count: {
          select: { likes: true },
        },
      },
    })

    // Update discussion stats
    await prisma.discussion.update({
      where: { id: discussionId },
      data: {
        commentCount: { increment: 1 },
        lastCommentAt: new Date(),
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "COMMENT_CREATED",
      resource: "comments",
      resourceId: comment.id,
      details: {
        discussionId,
        content: content.substring(0, 50),
        isReply: !!parentId,
      },
    })

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    })
  } catch (error) {
    console.error("Create comment error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    })
  }
}

/**
 * @desc Update a comment
 * @route PUT /api/comments/:id
 * @access Private (Owner, ADMIN, MODERATOR)
 */
const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { content } = req.body

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        discussion: {
          select: { isLocked: true },
        },
      },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    if (comment.discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot edit comment in locked discussion",
      })
    }

    // Check permissions
    const canEdit =
      comment.createdById === res.locals.user.id ||
      res.locals.user.role === "ADMIN" ||
      res.locals.user.role === "MODERATOR"

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      })
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
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
        _count: {
          select: { likes: true },
        },
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "COMMENT_UPDATED",
      resource: "comments",
      resourceId: id,
      details: { content: content.substring(0, 50) },
    })

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    })
  } catch (error) {
    console.error("Update comment error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message,
    })
  }
}

/**
 * @desc Delete a comment
 * @route DELETE /api/comments/:id
 * @access Private (Owner, ADMIN, MODERATOR)
 */
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check permissions
    const canDelete =
      comment.createdById === res.locals.user.id ||
      res.locals.user.role === "ADMIN" ||
      res.locals.user.role === "MODERATOR"

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      })
    }

    // Delete comment and all replies
    await prisma.$transaction(async (tx) => {
      // Delete all replies first
      await tx.comment.deleteMany({
        where: { parentId: id },
      })

      // Delete the comment
      await tx.comment.delete({
        where: { id },
      })

      // Update discussion comment count
      await tx.discussion.update({
        where: { id: comment.discussionId },
        data: {
          commentCount: { decrement: 1 + comment._count.replies },
        },
      })
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "COMMENT_DELETED",
      resource: "comments",
      resourceId: id,
      details: {
        content: comment.content.substring(0, 50),
        repliesDeleted: comment._count.replies,
      },
    })

    res.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    })
  }
}

/**
 * @desc Like/Unlike a comment
 * @route POST /api/comments/:id/like
 * @access Private
 */
const toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params
    const userId = res.locals.user.id

    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
    })

    let isLiked
    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId: id,
          },
        },
      })
      isLiked = false
    } else {
      await prisma.commentLike.create({
        data: {
          userId,
          commentId: id,
        },
      })
      isLiked = true
    }

    const likesCount = await prisma.commentLike.count({
      where: { commentId: id },
    })

    res.json({
      success: true,
      message: isLiked ? "Comment liked" : "Comment unliked",
      data: { isLiked, likesCount },
    })
  } catch (error) {
    console.error("Toggle like comment error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating like status",
      error: error.message,
    })
  }
}

/**
 * @desc Report a comment
 * @route POST /api/comments/:id/report
 * @access Private
 */
const reportComment = async (req, res) => {
  try {
    const { id } = req.params
    const { reason, description } = req.body
    const userId = res.locals.user.id

    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user already reported this comment
    const existingReport = await prisma.commentReport.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
    })

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this comment",
      })
    }

    const report = await prisma.commentReport.create({
      data: {
        userId,
        commentId: id,
        reason,
        description,
      },
    })

    await createAuditLog({
      userId,
      action: "COMMENT_REPORTED",
      resource: "comments",
      resourceId: id,
      details: { reason, description },
    })

    res.status(201).json({
      success: true,
      message: "Comment reported successfully",
      data: report,
    })
  } catch (error) {
    console.error("Report comment error:", error)
    res.status(500).json({
      success: false,
      message: "Error reporting comment",
      error: error.message,
    })
  }
}

/**
 * @desc Get all comments (with pagination)
 * @route GET /api/comments
 * @access Public
 */
const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", search } = req.query

    const skip = (page - 1) * limit
    const orderBy = { [sortBy]: sortOrder }

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { content: { contains: search, mode: "insensitive" } },
            {
              createdBy: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          discussion: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy,
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.comment.count({ where }),
    ])

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get all comments error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    })
  }
}

/**
 * @desc Reply to a comment
 * @route POST /api/comments/:id/reply
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
const replyToComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { content } = req.body

    // Find the parent comment
    const parentComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        discussion: {
          select: {
            id: true,
            isLocked: true,
          },
        },
      },
    })

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      })
    }

    if (parentComment.discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot reply to comment in locked discussion",
      })
    }

    // Create the reply
    const reply = await prisma.comment.create({
      data: {
        content,
        discussionId: parentComment.discussionId,
        parentId: id,
        createdById: res.locals.user.id,
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
        parent: {
          select: {
            id: true,
            content: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    })

    // Update discussion stats
    await prisma.discussion.update({
      where: { id: parentComment.discussionId },
      data: {
        commentCount: { increment: 1 },
        lastCommentAt: new Date(),
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "COMMENT_REPLY_CREATED",
      resource: "comments",
      resourceId: reply.id,
      details: {
        parentCommentId: id,
        discussionId: parentComment.discussionId,
        content: content.substring(0, 50),
      },
    })

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: reply,
    })
  } catch (error) {
    console.error("Reply to comment error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating reply",
      error: error.message,
    })
  }
}

/**
 * @desc Get replies to a comment
 * @route GET /api/comments/:id/replies
 * @access Public
 */
const getCommentReplies = async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "asc" } = req.query

    const skip = (page - 1) * limit
    const orderBy = { [sortBy]: sortOrder }

    // Verify parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      })
    }

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where: { parentId: id },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          _count: {
            select: { likes: true },
          },
        },
        orderBy,
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.comment.count({
        where: { parentId: id },
      }),
    ])

    res.json({
      success: true,
      data: replies,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get comment replies error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching comment replies",
      error: error.message,
    })
  }
}

/**
 * @desc Get comments by user
 * @route GET /api/comments/user/:userId
 * @access Public
 */
const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const skip = (page - 1) * limit
    const orderBy = { [sortBy]: sortOrder }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePic: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { createdById: userId },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          discussion: {
            select: {
              id: true,
              title: true,
              slug: true,
              theme: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          parent: {
            select: {
              id: true,
              content: true,
              createdBy: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy,
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.comment.count({
        where: { createdById: userId },
      }),
    ])

    res.json({
      success: true,
      data: {
        user,
        comments,
      },
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get comments by user error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user comments",
      error: error.message,
    })
  }
}

module.exports = {
  getCommentsByDiscussion,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  reportComment,
  getAllComments,
  replyToComment,
  getCommentReplies,
  getCommentsByUser,
}
