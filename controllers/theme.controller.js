
// const { PrismaClient } = require("@prisma/client")
// const { validationResult } = require("express-validator")
// const { logAudit, createAuditLog } = require("../utils/audit")
// const { default: slugify } = require("slugify")
// const prisma = new PrismaClient()

// /**
//  * @desc Get all themes
//  * @route GET /api/themes
//  * @access Public
//  */
// const getAllThemes = async (req, res) => {
//   try {
//     const themes = await prisma.theme.findMany({
//       include: {
//         createdBy: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             profilePic: true,
//           },
//         },
//         _count: {
//           select: { discussions: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     })
//     res.json({ success: true, data: themes })
//   } catch (error) {
//     console.error("Get themes error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error fetching themes",
//       error: error.message,
//     })
//   }
// }

// /**
//  * @desc Create a new theme
//  * @route POST /api/themes
//  * @access Private (ADMIN, MODERATOR, MEMBER)
//  */
// const createTheme = async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: errors.array(),
//       })
//     }

//     const { title, description, icon, color, category, tags, isPublic } = req.body

//     const theme = await prisma.theme.create({
//       data: {
//         title,
//         description,
//         icon,
//         color,
//         tags: tags || [],
//         isPublic: isPublic !== undefined ? isPublic : true,
//         createdById: res.locals.user.id,
//         slug: slugify(title.trim().toLowerCase(), { lower: true }),
//       },
//     })

//     await createAuditLog({
//       userId: res.locals.user.id,
//       action: "THEME_CREATED",
//       resource: "themes",
//       resourceId: theme.id,
//       details: { title, description },
//     })

//     res.status(201).json({
//       success: true,
//       message: "Theme created successfully",
//       data: theme,
//     })
//   } catch (error) {
//     console.error("Create theme error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error creating theme",
//       error: error.message,
//     })
//   }
// }

// /**
//  * @desc Update a theme
//  * @route PUT /api/themes/:id
//  * @access Private (ADMIN, MODERATOR, MEMBER)
//  */
// const updateTheme = async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: errors.array(),
//       })
//     }

//     const { id } = req.params
//     const { title, description, icon, color, category, tags, isPublic } = req.body

//     const existingTheme = await prisma.theme.findUnique({
//       where: { id },
//     })

//     if (!existingTheme) {
//       return res.status(404).json({
//         success: false,
//         message: "Theme not found",
//       })
//     }

//     const updatedTheme = await prisma.theme.update({
//       where: { id },
//       data: {
//         title,
//         description,
//         icon,
//         color,
//         category: category || "GENERAL",
//         tags: tags || [],
//         isPublic: isPublic !== undefined ? isPublic : true,
//         slug: slugify(title.trim().toLowerCase(), { lower: true }),
//       },
//     })

//     await createAuditLog({
//       userId: res.locals.user.id,
//       action: "THEME_UPDATED",
//       resource: "themes",
//       resourceId: id,
//       details: { title, description },
//     })

//     res.json({
//       success: true,
//       message: "Theme updated successfully",
//       data: updatedTheme,
//     })
//   } catch (error) {
//     console.error("Update theme error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error updating theme",
//       error: error.message,
//     })
//   }
// }

// /**
//  * @desc Delete a theme
//  * @route DELETE /api/themes/:id
//  * @access Private (ADMIN, MODERATOR)
//  */
// const deleteTheme = async (req, res) => {
//   try {
//     const { id } = req.params

//     const theme = await prisma.theme.findUnique({
//       where: { id },
//     })

//     if (!theme) {
//       return res.status(404).json({
//         success: false,
//         message: "Theme not found",
//       })
//     }

//     // Vérifier si le thème a des discussions associées
//     const discussionsCount = await prisma.discussion.count({
//       where: { themeId: id },
//     })

//     if (discussionsCount > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete theme: it has associated discussions",
//       })
//     }

//     await prisma.theme.delete({
//       where: { id },
//     })

//     await createAuditLog({
//       userId: res.locals.user.id,
//       action: "THEME_DELETED",
//       resource: "themes",
//       resourceId: id,
//       details: { title: theme.title },
//     })

//     res.json({
//       success: true,
//       message: "Theme deleted successfully",
//     })
//   } catch (error) {
//     console.error("Delete theme error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error deleting theme",
//       error: error.message,
//     })
//   }
// }

// const getThemeById = async (req, res) => {
//   try {
//     const { id } = req.params

//     const theme = await prisma.theme.findUnique({
//       where: { id },
//     })

//     if (!theme) {
//       return res.status(404).json({
//         success: false,
//         message: "Theme not found",
//       })
//     }

//     res.json({
//       success: true,
//       data: theme,
//     })
//   } catch (error) {
//     console.error("Get theme error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Error fetching theme",
//       error: error.message,
//     })
//   }
// }


// module.exports = {
//   getAllThemes,
//   createTheme,
//   updateTheme,
//   deleteTheme,
//   getThemeById
// }




const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { createAuditLog } = require("../utils/audit")
const { default: slugify } = require("slugify")
const prisma = new PrismaClient()

/**
 * @desc Get all themes
 * @route GET /api/themes
 * @access Public
 */
const getAllThemes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search,  isPublic } = req.query
    const skip = (page - 1) * limit

    const where = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }
    if (isPublic !== undefined) where.isPublic = isPublic === "true"

    const [themes, total] = await Promise.all([
      prisma.theme.findMany({
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
          _count: {
            select: {
              discussions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.theme.count({ where }),
    ])

    res.json({
      success: true,
      data: themes,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get themes error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching themes",
      error: error.message,
    })
  }
}

/**
 * @desc Get theme by ID or slug
 * @route GET /api/themes/:identifier
 * @access Public
 */
const getThemeById = async (req, res) => {
  try {
    const { id } = req.params

    const theme = await prisma.theme.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
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
        discussions: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: {
              select: { firstName: true, lastName: true },
            },
            _count: { select: { comments: true } },
          },
        },
        _count: {
          select: {
            discussions: true,
          },
        },
      },
    })

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    res.json({
      success: true,
      data: theme,
    })
  } catch (error) {
    console.error("Get theme error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching theme",
      error: error.message,
    })
  }
}

/**
 * @desc Get theme by slug
 * @route GET /api/themes/slug/:slug
 * @access Public
 */
const getThemeBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const theme = await prisma.theme.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        discussions: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: {
              select: { firstName: true, lastName: true },
            },
            _count: { select: { comments: true } },
          },
        },
        _count: {
          select: {
            discussions: true,
            followers: true,
          },
        },
      },
    })

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    res.json({
      success: true,
      data: theme,
    })
  } catch (error) {
    console.error("Get theme by slug error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching theme",
      error: error.message,
    })
  }
}

/**
 * @desc Create a new theme
 * @route POST /api/themes
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
const createTheme = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

  //     id          String       @id @default(uuid())
  // title       String
  // slug        String       @unique
  // isPublic    Boolean      @default(true) // Visibilité publique/privée
  // description String?
  // createdById String

    const { title, description,  status , isPublic = true } = req.body

    // Check if theme with same title exists
    const existingTheme = await prisma.theme.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    })

    if (existingTheme) {
      return res.status(400).json({
        success: false,
        message: "A theme with this title already exists",
      })
    }

    const theme = await prisma.theme.create({
      data: {
        title,
        description,
        status,
        // tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
        isPublic,
        createdById: res.locals.user.id,
        slug: slugify(title.trim(), { lower: true, strict: true }),
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
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "THEME_CREATED",
      resource: "themes",
      resourceId: theme.id,
      details: { title, description, status },
    })

    res.status(201).json({
      success: true,
      message: "Theme created successfully",
      data: theme,
    })
  } catch (error) {
    console.error("Create theme error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating theme",
      error: error.message,
    })
  }
}

/**
 * @desc Update a theme
 * @route PUT /api/themes/:id
 * @access Private (ADMIN, MODERATOR, Owner)
 */
const updateTheme = async (req, res) => {
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
    const { title, description,  status , isPublic = true } = req.body

    const existingTheme = await prisma.theme.findUnique({
      where: { id },
    })

    if (!existingTheme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    // Check permissions
    if (
      existingTheme.createdById !== res.locals.user.id &&
      res.locals.user.role !== "ADMIN" &&
      res.locals.user.role !== "MODERATOR"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this theme",
      })
    }

    const updateData = {}
    if (title) {
      updateData.title = title
      updateData.slug = slugify(title.trim(), { lower: true, strict: true })
    }
    if (description !== undefined) updateData.description = description
    if (isPublic !== undefined) updateData.isPublic = isPublic
    
    // updateData.tags = tags
    updateData.status = status

    const updatedTheme = await prisma.theme.update({
      where: { id },
      data: updateData,
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
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "THEME_UPDATED",
      resource: "themes",
      resourceId: id,
      details: { title: updatedTheme.title, changes: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.json({
      success: true,
      message: "Theme updated successfully",
      data: updatedTheme,
    })
  } catch (error) {
    console.error("Update theme error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating theme",
      error: error.message,
    })
  }
}

/**
 * @desc Delete a theme
 * @route DELETE /api/themes/:id
 * @access Private (ADMIN, MODERATOR, Owner)
 */
const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params
    const { force = false } = req.query

    const theme = await prisma.theme.findUnique({
      where: { id },
      include: {
        _count: {
          select: { discussions: true },
        },
      },
    })

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    // Check permissions
    if (
      theme.createdById !== res.locals.user.id &&
      res.locals.user.role !== "ADMIN" &&
      res.locals.user.role !== "MODERATOR"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this theme",
      })
    }

    // Check if theme has discussions
    if (theme._count.discussions > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete theme: it has associated discussions. Use force=true to delete anyway.",
        discussionsCount: theme._count.discussions,
      })
    }

    // If force delete, remove all associated discussions and comments
    if (force && theme._count.discussions > 0) {
      await prisma.$transaction(async (tx) => {
        // Delete all comments in discussions of this theme
        await tx.comment.deleteMany({
          where: {
            discussion: {
              themeId: id,
            },
          },
        })

        // Delete all discussions
        await tx.discussion.deleteMany({
          where: { themeId: id },
        })

        // Delete the theme
        await tx.theme.delete({
          where: { id },
        })
      })
    } else {
      await prisma.theme.delete({
        where: { id },
      })
    }

    await createAuditLog({
      userId: res.locals.user.id,
      action: "THEME_DELETED",
      resource: "themes",
      resourceId: id,
      details: {
        title: theme.title,
        force: !!force,
        discussionsDeleted: force ? theme._count.discussions : 0,
      },
    })

    res.json({
      success: true,
      message: "Theme deleted successfully",
    })
  } catch (error) {
    console.error("Delete theme error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting theme",
      error: error.message,
    })
  }
}

/**
 * @desc Follow/Unfollow a theme
 * @route POST /api/themes/:id/follow
 * @access Private
 */
const toggleFollowTheme = async (req, res) => {
  try {
    const { id } = req.params
    const userId = res.locals.user.id

    const theme = await prisma.theme.findUnique({
      where: { id },
    })

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    const existingFollow = await prisma.themeFollower.findUnique({
      where: {
        userId_themeId: {
          userId,
          themeId: id,
        },
      },
    })

    let isFollowing
    if (existingFollow) {
      await prisma.themeFollower.delete({
        where: {
          userId_themeId: {
            userId,
            themeId: id,
          },
        },
      })
      isFollowing = false
    } else {
      await prisma.themeFollower.create({
        data: {
          userId,
          themeId: id,
        },
      })
      isFollowing = true
    }

    res.json({
      success: true,
      message: isFollowing ? "Theme followed successfully" : "Theme unfollowed successfully",
      data: { isFollowing },
    })
  } catch (error) {
    console.error("Toggle follow theme error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating follow status",
      error: error.message,
    })
  }
}

/**
 * @desc Get all discussions for a theme
 * @route GET /api/themes/:id/discussions
 * @access Public
 */
const getThemeDiscussions = async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 10, sort = "recent", search } = req.query
    const skip = (page - 1) * limit

    const theme = await prisma.theme.findUnique({
      where: { id },
    })

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    const where = { themeId: id }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    let orderBy = { createdAt: "desc" }
    if (sort === "popular") {
      orderBy = { views: "desc" }
    } else if (sort === "active") {
      orderBy = { updatedAt: "desc" }
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
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
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy,
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
    console.error("Get theme discussions error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching theme discussions",
      error: error.message,
    })
  }
}

/**
 * @desc Get theme statistics
 * @route GET /api/themes/:id/stats
 * @access Public
 */
const getThemeStats = async (req, res) => {
  try {
    const { id } = req.params

    const theme = await prisma.theme.findUnique({
      where: { id },
    })

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      })
    }

    const [totalDiscussions, totalComments, totalFollowers, recentDiscussions, topContributors, monthlyStats] =
      await Promise.all([
        prisma.discussion.count({ where: { themeId: id } }),
        prisma.comment.count({
          where: { discussion: { themeId: id } },
        }),
        prisma.themeFollower.count({ where: { themeId: id } }),
        prisma.discussion.count({
          where: {
            themeId: id,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        prisma.user.findMany({
          where: {
            discussions: {
              some: { themeId: id },
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
            _count: {
              select: {
                discussions: {
                  where: { themeId: id },
                },
                comments: {
                  where: { discussion: { themeId: id } },
                },
              },
            },
          },
          orderBy: {
            discussions: {
              _count: "desc",
            },
          },
          take: 5,
        }),
        prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as discussions_count
        FROM discussions 
        WHERE theme_id = ${id}
          AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `,
      ])

    res.json({
      success: true,
      data: {
        overview: {
          totalDiscussions,
          totalComments,
          totalFollowers,
          recentDiscussions,
        },
        topContributors,
        monthlyStats,
        engagement: {
          averageCommentsPerDiscussion: totalDiscussions > 0 ? (totalComments / totalDiscussions).toFixed(2) : 0,
          followersGrowth: totalFollowers, // Could be enhanced with historical data
        },
      },
    })
  } catch (error) {
    console.error("Get theme stats error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching theme statistics",
      error: error.message,
    })
  }
}

module.exports = {
  getAllThemes,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
  toggleFollowTheme,
  getThemeBySlug,
  getThemeDiscussions,
  getThemeStats,
}
