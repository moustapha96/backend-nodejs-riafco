const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

/**
 * @desc Get all team members
 * @route GET /api/team-members
 * @access Public
 */
module.exports.getAllTeamMembers = async (req, res) => {
  try {
    const { sortBy = "order", sortOrder = "asc" } = req.query;

    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { [sortBy]: sortOrder },
    });

    res.status(200).json({
      teamMembers,
    });
  } catch (error) {
    console.error("Get all team members error:", error);
    res.status(500).json({
      message: "Failed to retrieve team members",
      code: "GET_TEAM_MEMBERS_ERROR",
    });
  }
};

/**
 * @desc Get team member by ID
 * @route GET /api/team-members/:id
 * @access Public
 */
module.exports.getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      return res.status(404).json({
        message: "Team member not found",
        code: "TEAM_MEMBER_NOT_FOUND",
      });
    }

    res.status(200).json({ teamMember });
  } catch (error) {
    console.error("Get team member by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve team member",
      code: "GET_TEAM_MEMBER_ERROR",
    });
  }
};

/**
 * @desc Create a new team member
 * @route POST /api/team-members
 * @access Private (ADMIN, MODERATOR)
 */
module.exports.createTeamMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, position, bio, order = 0 } = req.body;

    const teamMember = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        position: position.trim(),
        bio: bio?.trim(),
        order: Number(order),
        photo: req.file ? `/teams/${req.file.filename}` : null,
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "TEAM_MEMBER_CREATED",
      resource: "team_members",
      resourceId: teamMember.id,
      details: {
        name: teamMember.name,
        position: teamMember.position,
        createdBy: res.locals.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "Team member created successfully",
      teamMember,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({
      message: "Failed to create team member",
      code: "CREATE_TEAM_MEMBER_ERROR",
    });
  }
};

/**
 * @desc Update a team member
 * @route PUT /api/team-members/:id
 * @access Private (ADMIN, MODERATOR)
 */
module.exports.updateTeamMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name, position, bio, order } = req.body;

    const existingTeamMember = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existingTeamMember) {
      return res.status(404).json({
        message: "Team member not found",
        code: "TEAM_MEMBER_NOT_FOUND",
      });
    }

    const updateData = {
      name: name?.trim(),
      position: position?.trim(),
      bio: bio?.trim(),
      order: order !== undefined ? Number(order) : undefined,
    };

    if (req.file) {
      updateData.photo = `/teams/${req.file.filename}`;
    }

    const updatedTeamMember = await prisma.teamMember.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "TEAM_MEMBER_UPDATED",
      resource: "team_members",
      resourceId: id,
      details: {
        changes: updateData,
        updatedBy: res.locals.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Team member updated successfully",
      teamMember: updatedTeamMember,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({
      message: "Failed to update team member",
      code: "UPDATE_TEAM_MEMBER_ERROR",
      details: error.message,
    });
  }
};

/**
 * @desc Delete a team member
 * @route DELETE /api/team-members/:id
 * @access Private (ADMIN)
 */
module.exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTeamMember = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existingTeamMember) {
      return res.status(404).json({
        message: "Team member not found",
        code: "TEAM_MEMBER_NOT_FOUND",
      });
    }

    await prisma.teamMember.delete({
      where: { id },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "TEAM_MEMBER_DELETED",
      resource: "team_members",
      resourceId: id,
      details: {
        deletedTeamMember: existingTeamMember.name,
        deletedBy: res.locals.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({
      message: "Failed to delete team member",
      code: "DELETE_TEAM_MEMBER_ERROR",
    });
  }
};

/**
 * @desc Reorder team members
 * @route PUT /api/team-members/reorder
 * @access Private (ADMIN, MODERATOR)
 */
module.exports.reorderTeamMembers = async (req, res) => {
  try {
    const { members } = req.body;

    if (!Array.isArray(members)) {
      return res.status(400).json({
        message: "Members must be an array",
        code: "INVALID_MEMBERS_ARRAY",
      });
    }

    const updatePromises = members.map((member) =>
      prisma.teamMember.update({
        where: { id: member.id },
        data: { order: member.order },
      })
    );

    await Promise.all(updatePromises);

    await createAuditLog({
      userId: res.locals.user.id,
      action: "TEAM_MEMBERS_REORDERED",
      resource: "team_members",
      details: {
        reorderedBy: res.locals.user.email,
        newOrder: members.map((m) => ({ id: m.id, order: m.order })),
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Team members reordered successfully",
    });
  } catch (error) {
    console.error("Reorder team members error:", error);
    res.status(500).json({
      message: "Failed to reorder team members",
      code: "REORDER_TEAM_MEMBERS_ERROR",
    });
  }
};
