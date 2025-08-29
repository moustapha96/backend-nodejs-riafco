const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { logAudit, createAuditLog } = require("../utils/audit");
const { default: slugify } = require("slugify");
const prisma = new PrismaClient();

/**
 * @desc Get all themes
 * @route GET /api/themes
 * @access Public
 */
const getAllThemes = async (req, res) => {
  try {
    const themes = await prisma.theme.findMany({
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
          select: { discussions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: themes });
  } catch (error) {
    console.error("Get themes error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching themes",
      error: error.message
    });
  }
};

/**
 * @desc Create a new theme
 * @route POST /api/themes
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
const createTheme = async (req, res) => {

  console.log(req.user)
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }
    const { title, description , createdBy } = req.body;

    const theme = await prisma.theme.create({
      data: {
        title,
        description,
        createdById: createdBy,
        slug: slugify(title.trim().toLowerCase(), { lower: true }),
      },
    });

     await createAuditLog (
      res.locals.user.id,
      "CREATE",
      "Theme",
      theme.id,
      { title, description },
      req.ip,
      req.get("User-Agent")
    );

    res.status(201).json({
      success: true,
      message: "Theme created successfully",
      data: theme
    });
  } catch (error) {
    console.error("Create theme error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating theme",
      error: error.message
    });
  }
};

/**
 * @desc Update a theme
 * @route PUT /api/themes/:id
 * @access Private (ADMIN, MODERATOR, MEMBER)
 */
const updateTheme = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description } = req.body;

    const existingTheme = await prisma.theme.findUnique({
      where: { id }
    });

    if (!existingTheme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found"
      });
    }

    const updatedTheme = await prisma.theme.update({
      where: { id },
      data: {
        title,
        description,
        slug: slugify(title.trim().toLowerCase(), { lower: true }),
      },
    });

    await createAuditLog(
      res.locals.user.id,
      "UPDATE",
      "Theme",
      id,
      { title, description },
      req.ip,
      req.get("User-Agent")
    );

    res.json({
      success: true,
      message: "Theme updated successfully",
      data: updatedTheme
    });
  } catch (error) {
    console.error("Update theme error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating theme",
      error: error.message
    });
  }
};

/**
 * @desc Delete a theme
 * @route DELETE /api/themes/:id
 * @access Private (ADMIN, MODERATOR)
 */
const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;

    const theme = await prisma.theme.findUnique({
      where: { id }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found"
      });
    }

    // Vérifier si le thème a des discussions associées
    const discussionsCount = await prisma.discussion.count({
      where: { themeId: id }
    });

    if (discussionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete theme: it has associated discussions"
      });
    }

    await prisma.theme.delete({
      where: { id }
    });

    await createAuditLog(
      res.locals.user.id,
      "DELETE",
      "Theme",
      id,
      { title: theme.title },
      req.ip,
      req.get("User-Agent")
    );

    res.json({
      success: true,
      message: "Theme deleted successfully"
    });
  } catch (error) {
    console.error("Delete theme error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting theme",
      error: error.message
    });
  }
};

module.exports = {
  getAllThemes,
  createTheme,
  updateTheme,
  deleteTheme
};
