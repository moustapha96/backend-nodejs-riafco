
const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { createAuditLog } = require("../utils/audit")
const { default: slugify } = require("slugify")
const prisma = new PrismaClient()

/**
 * @desc Get all discussions
 * @route GET /api/discussions
 * @access Public
 */
const getAllDiscussions = async (req, res) => {
  try {
    const { themeId, page = 1, limit = 10, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const skip = (page - 1) * limit
    const where = {}

    if (themeId) where.themeId = themeId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    const orderBy = {}
    if (sortBy === "popularity") {
      orderBy.commentCount = sortOrder
    } else if (sortBy === "lastActivity") {
      orderBy.lastCommentAt = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        include: {
          theme: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [
          orderBy,
        ],
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.discussion.count({ where }),
    ])

    res.json({
      success: true,
      data: discussions,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get discussions error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussions",
      error: error.message,
    })
  }
}

/**
 * @desc Get discussions by theme ID
 * @route GET /api/themes/:id/discussions
 * @access Public
 */
const getDiscussionsByTheme = async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const skip = (page - 1) * limit
    const orderBy = {}

    if (sortBy === "popularity") {
      orderBy.commentCount = sortOrder
    } else if (sortBy === "lastActivity") {
      orderBy.lastCommentAt = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where: { themeId: id },
        include: {
          theme: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [ orderBy],
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.discussion.count({ where: { themeId: id } }),
    ])

    res.json({
      success: true,
      data: discussions,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get discussions by theme error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussions",
      error: error.message,
    })
  }
}

// /**
//  * @desc Get discussion by ID
//  * @route GET /api/discussions/:id
//  * @access Public
//  */
// // const getDiscussionById = async (req, res) => {
// //   try {
// //     const { id } = req.params
// //     const { includeComments = true } = req.query

// //     const include = {
// //       theme: {
// //         select: {
// //           id: true,
// //           title: true,
// //           slug: true,
// //         },
// //       },
// //       createdBy: {
// //         select: {
// //           id: true,
// //           firstName: true,
// //           lastName: true,
// //           profilePic: true,
// //         },
// //       },
// //       _count: {
// //         select: {
// //           comments: true,
// //         },
// //       },
// //     }

// //     if (includeComments === "true") {
// //       include.comments = {
// //         where: { parentId: null }, // Only top-level comments
// //         include: {
// //           createdBy: {
// //             select: {
// //               id: true,
// //               firstName: true,
// //               lastName: true,
// //               profilePic: true,
// //             },
// //           },
// //           replies: {
// //             include: {
// //               createdBy: {
// //                 select: {
// //                   id: true,
// //                   firstName: true,
// //                   lastName: true,
// //                   profilePic: true,
// //                 },
// //               },
// //             },
// //             orderBy: { createdAt: "asc" },
// //           },
          
// //         },
// //         orderBy: { createdAt: "asc" },
// //       }
// //     }

// //     const discussion = await prisma.discussion.findUnique({
// //       where: { id },
// //       include,
// //     })

// //     if (!discussion) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Discussion not found",
// //       })
// //     }


// //     res.json({
// //       success: true,
// //       data: discussion,
// //     })
// //   } catch (error) {
// //     console.error("Get discussion error:", error)
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to retrieve discussion",
// //       error: error.message,
// //     })
// //   }
// // }

/**
 * @desc Get discussion by ID
 * @route GET /api/discussions/:id
 * @access Public
 */
const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeComments = true } = req.query;

    const include = {
      theme: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePic: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    };

    if (includeComments === "true") {
      include.comments = {
        where: { parentId: null }, // Only top-level comments
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          // Ajoute le compteur de likes pour chaque commentaire
          _count: {
            select: {
              likes: true,
            },
          },
          // Optionnel : inclure les utilisateurs ayant liké (si nécessaire)
          likes: {
            select: {
              user: {
                select: {
                  id: true,
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
              // Ajoute aussi le compteur de likes pour les réponses
              _count: {
                select: {
                  likes: true,
                },
              },
              // Optionnel : inclure les utilisateurs ayant liké les réponses
              likes: {
                select: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      };
    }

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include,
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    res.json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    console.error("Get discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussion",
      error: error.message,
    });
  }
};


/**
 * @desc Get discussion by slug
 * @route GET /api/discussions/slug/:slug
 * @access Public
 */
const getDiscussionBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const { includeComments = true } = req.query

    const include = {
      theme: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePic: true,
        },
      },
      _count: {
        select: {
          comments: true,
         
        },
      },
    }

    if (includeComments === "true") {
      include.comments = {
        where: { parentId: null },
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
            orderBy: { createdAt: "asc" },
          },
         
        },
        orderBy: { createdAt: "asc" },
      }
    }

    const discussion = await prisma.discussion.findUnique({
      where: { slug },
      include,
    })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Increment view count
    await prisma.discussion.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    })

    res.json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    console.error("Get discussion by slug error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussion",
      error: error.message,
    })
  }
}

/**
 * @desc Get discussions by theme ID
 * @route GET /api/discussions/theme/:id
 * @access Public
 */
const getAllDiscussionsTheme = async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", search } = req.query

    const skip = (page - 1) * limit
    const where = { themeId: id }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    const orderBy = {}
    if (sortBy === "popularity") {
      orderBy.commentCount = sortOrder
    } else if (sortBy === "lastActivity") {
      orderBy.lastCommentAt = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        include: {
          theme: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          _count: {
            select: {
              comments: true,
             
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, orderBy],
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.discussion.count({ where }),
    ])

    res.json({
      success: true,
      data: discussions,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get discussions by theme error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussions",
      error: error.message,
    })
  }
}

/**
 * @desc Get discussions with comments by theme
 * @route GET /api/discussions/theme/:id/with-comments
 * @access Public
 */
const getDiscussionsWithComments = async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const skip = (page - 1) * limit
    const orderBy = {}

    if (sortBy === "popularity") {
      orderBy.commentCount = sortOrder
    } else if (sortBy === "lastActivity") {
      orderBy.lastCommentAt = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where: { themeId: id },
        include: {
          theme: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
          comments: {
            where: { parentId: null },
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
                orderBy: { createdAt: "asc" },
              },
              
            },
            orderBy: { createdAt: "asc" },
            take: 5, // Limit comments per discussion for performance
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [ orderBy],
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.discussion.count({ where: { themeId: id } }),
    ])

    res.json({
      success: true,
      data: discussions,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get discussions with comments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussions with comments",
      error: error.message,
    })
  }
}

/**
 * @desc Get single discussion with comments
 * @route GET /api/discussions/:id/with-comments
 * @access Public
 */
const getDiscussionWithComments = async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20 } = req.query

    const skip = (page - 1) * limit

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        _count: {
          select: {
            comments: true,
           
          },
        },
      },
    })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    const [comments, totalComments] = await Promise.all([
      prisma.comment.findMany({
        where: {
          discussionId: id,
          parentId: null,
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
                select: {
                 
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          
        },
        orderBy: { createdAt: "asc" },
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.comment.count({
        where: {
          discussionId: id,
          parentId: null,
        },
      }),
    ])

    // Increment view count
    await prisma.discussion.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    res.json({
      success: true,
      data: {
        ...discussion,
        comments,
      },
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: totalComments,
        pages: Math.ceil(totalComments / limit),
      },
    })
  } catch (error) {
    console.error("Get discussion with comments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discussion with comments",
      error: error.message,
    })
  }
}

/**
 * @desc Create a discussion
 * @route POST /api/discussions
 * @access Private (ADMIN, GUEST, MEMBER)
 */
const createDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { title, content, themeId } = req.body

    // Verify theme exists
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
    })

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    // Check if user can pin discussions
    const canPin = res.locals.user.role === "ADMIN" || res.locals.user.role === "MEMBER" || res.locals.user.role === "GUEST"

    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        themeId,
        createdById: res.locals.user.id,
      },
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    })

    // Update theme stats
    await prisma.theme.update({
      where: { id: themeId },
      data: {
        discussionCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "DISCUSSION_CREATED",
      resource: "discussions",
      resourceId: discussion.id,
      details: {
        title: discussion.title,
        theme: discussion.theme.title,
      },
    })

    res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      data: discussion,
    })
  } catch (error) {
    console.error("Create discussion error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create discussion",
      error: error.message,
    })
  }
}

/**
 * @desc Update a discussion
 * @route PUT /api/discussions/:id
 * @access Private (Owner, ADMIN, GUEST)
 */
const updateDiscussion = async (req, res) => {
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
    const { title, content, tags,  isLocked } = req.body

    const discussion = await prisma.discussion.findUnique({
      where: { id },
    })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Check permissions
    const canEdit =
      discussion.createdById === res.locals.user.id ||
      res.locals.user.role === "ADMIN" ||
      res.locals.user.role === "GUEST" ||
      res.locals.user.role === "MEMBER" ||
      res.locals.user.role === "SUPER_ADMIN"

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this discussion",
      })
    }

    // Only admins/moderators can pin or lock discussions
    const canModerate = res.locals.user.role === "ADMIN" ||
          res.locals.user.role === "GUEST" || res.locals.user.role === "MEMBER"

    const updateData = {}
    if (title) {
      updateData.title = title
    }
    if (content !== undefined) updateData.content = content
    // if (tags !== undefined) updateData.tags = tags
    if (isLocked !== undefined && canModerate) updateData.isLocked = isLocked

    const updatedDiscussion = await prisma.discussion.update({
      where: { id },
      data: updateData,
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "DISCUSSION_UPDATED",
      resource: "discussions",
      resourceId: id,
      details: {
        title: updatedDiscussion.title,
        changes: Object.keys(updateData),
      },
    })

    res.json({
      success: true,
      message: "Discussion updated successfully",
      data: updatedDiscussion,
    })
  } catch (error) {
    console.error("Update discussion error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update discussion",
      error: error.message,
    })
  }
}

/**
 * @desc Delete a discussion
 * @route DELETE /api/discussions/:id
 * @access Private (Owner, ADMIN, GUEST , MEMBER)
 */
const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Check permissions
    const canDelete =
      discussion.createdById === res.locals.user.id ||
      res.locals.user.role === "ADMIN" ||
      res.locals.user.role === "MEMBER" ||
      res.locals.user.role === "GUEST" || 
      res.locals.user.role === "SUPER_ADMIN"

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this discussion",
      })
    }

    // Delete discussion and all associated comments
    await prisma.$transaction(async (tx) => {
      // Delete all comments
      await tx.comment.deleteMany({
        where: { discussionId: id },
      })

      // Delete the discussion
      await tx.discussion.delete({
        where: { id },
      })

      // Update theme stats
      await tx.theme.update({
        where: { id: discussion.themeId },
        data: {
          discussionCount: { decrement: 1 },
        },
      })
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "DISCUSSION_DELETED",
      resource: "discussions",
      resourceId: id,
      details: {
        title: discussion.title,
        commentsDeleted: discussion._count.comments,
      },
    })

    res.json({
      success: true,
      message: "Discussion deleted successfully",
    })
  } catch (error) {
    console.error("Delete discussion error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete discussion",
      error: error.message,
    })
  }
}

/**
 * @desc Like/Unlike a discussion
 * @route POST /api/discussions/:id/like
 * @access Private
 */
const toggleLikeDiscussion = async (req, res) => {

}

/**
 * @desc Create a comment
 * @route POST /api/discussions/:discussionId/comments
 * @access Private (ADMIN, GUEST ,  MEMBER)
 */
const createComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { discussionId } = req.params
    const { content } = req.body

    const comment = await prisma.comment.create({
      data: {
        content,
        discussionId,
        createdById: res.locals.user.id,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "COMMENT_CREATED",
      resource: "comments",
      resourceId: comment.id,
      details: { discussionId, content: comment.content.substring(0, 50) },
    })

    res.status(201).json({ comment })
  } catch (error) {
    res.status(500).json({ message: "Failed to create comment", error: error.message })
  }
}

// /**
//  * @desc Get all comments for a discussion
//  * @route GET /api/discussions/:discussionId/comments
//  * @access Public
//  */
// const getDiscussionComments = async (req, res) => {
//   try {
//     const { discussionId } = req.params;
//     const { page = 1, limit = 20 } = req.query;
//     const skip = (page - 1) * limit;

//     // Vérifier que la discussion existe
//     const discussion = await prisma.discussion.findUnique({
//       where: { id: discussionId },
//     });
//     if (!discussion) {
//       return res.status(404).json({
//         success: false,
//         message: "Discussion not found",
//       });
//     }

//     const [comments, total] = await Promise.all([
//       prisma.comment.findMany({
//         where: {
//           discussionId,
//           parentId: null, // Seuls les commentaires de niveau supérieur
//         },
//         include: {
//           createdBy: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               profilePic: true,
//             },
//           },
//           replies: {
//             include: {
//               createdBy: {
//                 select: {
//                   id: true,
//                   firstName: true,
//                   lastName: true,
//                   profilePic: true,
//                 },
//               },
             
//             },
//             orderBy: { createdAt: "asc" },
//           },
//         },
//         orderBy: { createdAt: "asc" },
//         skip: Number.parseInt(skip),
//         take: Number.parseInt(limit),
//       }),
//       prisma.comment.count({
//         where: {
//           discussionId,
//           parentId: null,
//         },
//       }),
//     ]);

//     res.json({
//       success: true,
//       data: comments,
//       pagination: {
//         page: Number.parseInt(page),
//         limit: Number.parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Get discussion comments error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve comments",
//       error: error.message,
//     });
//   }
// };
/**
 * @desc Get all comments for a discussion
 * @route GET /api/discussions/:discussionId/comments
 * @access Public
 */
const getDiscussionComments = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Vérifier que la discussion existe
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Récupérer les commentaires avec leurs likes et replies
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          discussionId,
          parentId: null, // Seuls les commentaires de niveau supérieur
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
          // Ajoute le compteur de likes pour chaque commentaire
          _count: {
            select: {
              likes: true,
              replies: true, // Optionnel : nombre de réponses
            },
          },
          // Optionnel : inclure les utilisateurs ayant liké (limité à 3 pour éviter la surcharge)
          likes: {
            take: 3, // Limite le nombre de likes retournés
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          // Inclure les replies avec leurs likes
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
                select: {
                  likes: true,
                },
              },
              likes: {
                take: 3, // Limite le nombre de likes retournés
                select: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.comment.count({
        where: {
          discussionId,
          parentId: null,
        },
      }),
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get discussion comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve comments",
      error: error.message,
    });
  }
};


/**
 * @desc Pin/Unpin a discussion
 * @route POST /api/discussions/:id/pin
 * @access Private (ADMIN, GUEST , MEMBER)
 */
const togglePinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
    });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const updatedDiscussion = await prisma.discussion.update({
      where: { id },
      data: {  },
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "DISCUSSION_UNPINNED" ,
      resource: "discussions",
      resourceId: id,
      details: {
        title: updatedDiscussion.title,
      },
    });

    res.json({
      success: true,
      message: `Discussion ${updatedDiscussion.id ? "pinned" : "unpinned"} successfully`,
      data: updatedDiscussion,
    });
  } catch (error) {
    console.error("Toggle pin discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update pin status",
      error: error.message,
    });
  }
};

/**
 * @desc Close/Open a discussion
 * @route POST /api/discussions/:id/close
 * @access Private (ADMIN, GUEST , MEMBER)
 */
const toggleCloseDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
    });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const updatedDiscussion = await prisma.discussion.update({
      where: { id },
      data: { isLocked: !discussion.isLocked },
      include: {
        theme: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: discussion.isLocked ? "DISCUSSION_OPENED" : "DISCUSSION_CLOSED",
      resource: "discussions",
      resourceId: id,
      details: {
        title: updatedDiscussion.title,
        isLocked: updatedDiscussion.isLocked,
      },
    });

    res.json({
      success: true,
      message: `Discussion ${updatedDiscussion.isLocked ? "closed" : "opened"} successfully`,
      data: updatedDiscussion,
    });
  } catch (error) {
    console.error("Toggle close discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discussion status",
      error: error.message,
    });
  }
};

/**
 * @desc Reply to a comment
 * @route POST /api/discussions/:discussionId/comments/:commentId/reply
 * @access Private (ADMIN, GUEST , MEMBER)
 */
const replyToComment = async (req, res) => {
  try {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { discussionId, commentId } = req.params;
    const { content } = req.body;
    const userId = res.locals.user.id;

    // Vérifie que la discussion existe
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Vérifie que le commentaire parent existe
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
    }

    // Crée la réponse au commentaire
    const reply = await prisma.comment.create({
      data: {
        content,
        discussionId,
        createdById: userId,
        parentId: commentId, // Définit le parentId pour créer une relation hiérarchique
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

    // Met à jour la date de dernière activité de la discussion
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { lastCommentAt: new Date() },
    });

    // Crée un log d'audit
    await createAuditLog({
      userId,
      action: "COMMENT_REPLIED",
      resource: "comments",
      resourceId: reply.id,
      details: {
        discussionId,
        parentCommentId: commentId,
        content: reply.content.substring(0, 50),
      },
    });

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: reply,
    });
  } catch (error) {
    console.error("Reply to comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reply",
      error: error.message,
    });
  }
};

/**
 * @desc Like/Unlike a comment
 * @route POST /api/discussions/:discussionId/comments/:commentId/like
 * @access Private (ADMIN, GUEST , MEMBER)
 */
const likeComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const userId = res.locals.user.id;

    // Vérifie que la discussion existe
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Vérifie que le commentaire existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Vérifie si l'utilisateur a déjà liké ce commentaire
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    let action;
    if (existingLike) {
      // Si le like existe, on le supprime (unlike)
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });
      action = "COMMENT_UNLIKED";
    } else {
      // Sinon, on crée un like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
      action = "COMMENT_LIKED";
    }

    // Met à jour le nombre de likes du commentaire
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    // Crée un log d'audit
    await createAuditLog({
      userId,
      action,
      resource: "comment_likes",
      resourceId: commentId,
      details: {
        discussionId,
        commentId,
        isLiked: !existingLike,
      },
    });

    res.json({
      success: true,
      message: `Comment ${existingLike ? "unliked" : "liked"} successfully`,
      data: {
        commentId,
        isLiked: !existingLike,
        likeCount: updatedComment._count.likes,
      },
    });
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like/unlike comment",
      error: error.message,
    });
  }
};


module.exports = {
  togglePinDiscussion,
  toggleCloseDiscussion,
  getAllDiscussions,
  getDiscussionComments,
  createComment,
  getDiscussionsByTheme,
  getDiscussionById,
  getDiscussionBySlug,
  getAllDiscussionsTheme,
  getDiscussionsWithComments,
  getDiscussionWithComments,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  toggleLikeDiscussion,
  replyToComment,
  likeComment
}
