const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const emailService = require("../services/email.service");
const { createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

module.exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);

    // Build where clause for filtering
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          profilePic: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          permissions: true,
          _count: {
            select: {
              activities: true,
              events: true,
              news: true,
              resources: true,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      users,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
      filters: { search, role, status, sortBy, sortOrder },
    });

  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      message: "Failed to retrieve users",
      code: "GET_USERS_ERROR",
    });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePic: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        permissions: true,
        _count: {
          select: {
            activities: true,
            events: true,
            news: true,
            resources: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve user",
      code: "GET_USER_ERROR",
    });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      role = "ADMIN",
      status = "ACTIVE",
      sendInvitation = true,
      permissions: permissionNames
    } = req.body;

    const existingPermissions = await prisma.permission.findMany({
      where: {
        name: { in: permissionNames },
      },
    });
   
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use",
        code: "EMAIL_EXISTS",
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        phone: phone?.trim(),
        password: hashedPassword,
        role,
        status,
        profilePic: req.file ? `http://localhost:5000/uploads/profiles/${req.file.filename}` : null,
        permissions: {
          connect: existingPermissions.map((permission) => ({ id: permission.id })),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profilePic: true,
        permissions: true, 
        
        createdAt: true,
      }
    });

    // Create audit log
    await createAuditLog({
      userId: res.locals.user.id,
      action: "USER_CREATED",
      resource: "users",
      resourceId: user.id,
      details: {
        email: user.email,
        role: user.role,
        permissions: user.permissions.map((p) => p.name),
        createdBy: res.locals.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Send invitation email if requested
    if (sendInvitation) {
      try {
        await emailService.sendInvitationEmail(user, tempPassword);
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
        // Don't fail user creation if email fails
      }
    }
    res.status(201).json({
      message: "User created successfully",
      user,
      tempPassword: sendInvitation ? undefined : tempPassword, // Only return password if not sending email
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      message: "Failed to create user",
      code: "CREATE_USER_ERROR",
    });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { firstName, lastName, phone, role, status, organizationId , permissions} = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Prevent self-role modification for non-admins
    if (id === res.locals.user.id && role && role !== existingUser.role && res.locals.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Cannot modify your own role",
        code: "SELF_ROLE_MODIFICATION",
      });
    }


     const existingPermissions = await prisma.permission.findMany({
      where: {
        name: { in: permissions },
      },
     });
    
    const updateData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      phone: phone?.trim(),
      role,
      status,
      profilePic: req.file ? `http://localhost:5000/uploads/profiles/${req.file.filename}` : existingUser.profilePic,
      permissions: {
        connect: existingPermissions.map((permission) => ({ id: permission.id })),
      },
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (req.file) {
      updateData.profilePic = `http://localhost:5000/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profilePic: true,
        permissions: true, 
        organization: {
          select: {
            id: true,
            name: true,
            sector: true,
            country: true,
          },
        },
        updatedAt: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: res.locals.user.id,
      action: "USER_UPDATED",
      resource: "users",
      resourceId: id,
      details: {
        changes: updateData,
        updatedBy: res.locals.user.email,
        organization: updatedUser.organization?.name,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Failed to update user",
      code: "UPDATE_USER_ERROR",
    });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { archive = false } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Prevent self-deletion
    if (id === res.locals.user.id) {
      return res.status(403).json({
        message: "Cannot delete your own account",
        code: "SELF_DELETION",
      });
    }

    if (archive) {
      // Archive user instead of deleting
      await prisma.user.update({
        where: { id },
        data: { status: "INACTIVE" },
      });

      await createAuditLog({
        userId: res.locals.user.id,
        action: "USER_ARCHIVED",
        resource: "users",
        resourceId: id,
        details: {
          archivedUser: existingUser.email,
          archivedBy: res.locals.user.email,
          organization: existingUser.organization?.name,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(200).json({
        message: "User archived successfully",
      });
    } else {
      // Permanently delete user
      await prisma.user.delete({
        where: { id },
      });

      await createAuditLog({
        userId: res.locals.user.id,
        action: "USER_DELETED",
        resource: "users",
        resourceId: id,
        details: {
          deletedUser: existingUser.email,
          deletedBy: res.locals.user.email,
          organization: existingUser.organization?.name,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(200).json({
        message: "User deleted successfully",
      });
    }
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: "Failed to delete user",
      code: "DELETE_USER_ERROR",
    });
  }
};

module.exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmail = true } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Generate new temporary password
    const newPassword = crypto.randomBytes(8).toString("hex");
    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Create audit log
    await createAuditLog({
      userId: res.locals.user.id,
      action: "PASSWORD_RESET_BY_ADMIN",
      resource: "users",
      resourceId: id,
      details: {
        resetFor: user.email,
        resetBy: res.locals.user.email,
        organization: user.organization?.name,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Send email notification if requested
    if (sendEmail) {
      try {
        await emailService.sendPasswordResetNotification(user, newPassword);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Don't fail the operation if email fails
      }
    }

    res.status(200).json({
      message: "Password reset successfully",
      tempPassword: sendEmail ? undefined : newPassword, // Only return password if not sending email
    });
  } catch (error) {
    console.error("Reset user password error:", error);
    res.status(500).json({
      message: "Failed to reset password",
      code: "RESET_PASSWORD_ERROR",
    });
  }
};

module.exports.getUserStats = async (req, res) => {
  try {
    const stats = await prisma.user.groupBy({
      by: ["role", "status"],
      _count: {
        id: true,
      },
    });

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: "ACTIVE" },
    });

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    res.status(200).json({
      totalUsers,
      activeUsers,
      recentUsers,
      breakdown: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      message: "Failed to get user statistics",
      code: "GET_STATS_ERROR",
    });
  }
};
