const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const emailService = require("../services/email.service");
const { createAuditLog } = require("../utils/audit");
const { isArray } = require("util");
const prisma = new PrismaClient();
const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12;

module.exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 5,
      search,
      role,
      status,
      sortBy = "createdAt", sortOrder = "desc",
      permissions = ""
    } = req.query;
    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);

    // Build where clause for filtering
    const where = {};
    where.archived = false;
    
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

    if (permissions) {
      where.permissions = {
        some: {
          name: { contains: permissions, mode: "insensitive" }
        }
      };
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
      role = "MEMBER",
      status = "INACTIVE",
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
        message: "Adresse email déjà utilisé",
        code: "EMAIL_EXISTS",
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
    const registerToken = crypto.randomBytes(16).toString("hex");
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1h


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
        registerToken,
        registerTokenExpiry: expiryDate,
        profilePic: req.file ? `/profiles/${req.file.filename}` : null,
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

    try {
      await emailService.sendInvitationEmail(user, tempPassword, registerToken);
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
    }

    res.status(201).json({
      message: "User created successfully",
      user,
      tempPassword: tempPassword, // Only return password if not sending email
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
        message: "Erreurs de validation",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { email, firstName, lastName, phone, role, status, permissions = [] } = req.body;

    // 1. Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { permissions: true }
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
    }

    if (email && email.toLowerCase() !== existingUser.email) {
      const emailUsed = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailUsed) {
        return res.status(400).json({
          message: "Cette adresse e-mail est déjà utilisée par un autre utilisateur.",
          code: "EMAIL_EXISTS",
        });
      }
    }


    // 2. Empêcher la modification de son propre rôle pour les non-admins
    if (id === res.locals.user.id && role && role !== existingUser.role && res.locals.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Vous ne pouvez pas modifier votre propre rôle",
        code: "SELF_ROLE_MODIFICATION",
      });
    }

    // 3. Trouver ou créer les permissions nécessaires
    const permissionRecords = await Promise.all(
      permissions.map(async (permissionName) => {
        return await prisma.permission.upsert({
          where: { name: permissionName.trim() },
          create: {
            name: permissionName.trim(),
            description: `Permission ${permissionName.trim()}` // Description par défaut
          },
          update: {}
        });
      })
    );

    // 4. Préparer les données de mise à jour
    const updateData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      phone: phone?.trim(),
      role,
      status,
      permissions: {
        set: [], // Réinitialiser les permissions existantes
      }
    };
    if (email) {
      updateData.email = email.toLowerCase().trim();
    }

    // Ajouter les nouvelles permissions seulement si le tableau n'est pas vide
    if (permissionRecords.length > 0) {
      updateData.permissions.connect = permissionRecords.map(permission => ({
        id: permission.id
      }));
    }

    // Supprimer les valeurs undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    // 5. Gérer l'upload de la photo de profil
    if (req.file) {
      updateData.profilePic = `/profiles/${req.file.filename}`;
    }

    // 6. Mettre à jour l'utilisateur
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
        permissions: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        updatedAt: true,
      },
    });

    // 7. Envoyer l'email approprié selon le statut
    if (updatedUser.status === "INACTIVE") {
      try {
        await emailService.sendInactiveStatusEmail(updatedUser);
      } catch (emailError) {
        console.error("Échec de l'envoi de l'email de statut inactif:", emailError);
      }
    } else if (status === "ACTIVE" && existingUser.status !== "ACTIVE") {
      // Seulement envoyer l'email d'activation si le statut a changé vers ACTIVE
      try {
        await emailService.sendActiveStatusEmail(updatedUser);
      } catch (emailError) {
        console.error("Échec de l'envoi de l'email de statut actif:", emailError);
      }
    }

    // 8. Créer un log d'audit
    await createAuditLog({
      userId: res.locals.user.id,
      action: "USER_UPDATED",
      resource: "users",
      resourceId: id,
      details: {
        changes: {
          ...updateData,
          permissions: permissions // Stocker les noms des permissions pour le log
        },
        updatedBy: res.locals.user.email,
        previousStatus: existingUser.status,
        newStatus: status,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({
      message: "Échec de la mise à jour de l'utilisateur",
      code: "UPDATE_USER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

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

    // Prevent self-deletion
    if (id === res.locals.user.id) {
      return res.status(403).json({
        message: "Cannot delete your own account",
        code: "SELF_DELETION",
      });
    }

    if (existingUser) {
      // Archive user instead of deleting
      await prisma.user.update({
        where: { id },
        data: { status: "INACTIVE" , blocked: true , archived : true },
      });

      await createAuditLog({
        userId: res.locals.user.id,
        action: "USER_ARCHIVED",
        resource: "users",
        resourceId: id,
        details: {
          archivedUser: existingUser.email,
          archivedBy: res.locals.user.email
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(200).json({
        message: "User archived successfully",
      });
    } else {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
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


module.exports.sendMailToUser = async (req, res) => {
  try {
    const { to, subject, html, attachments } = req.body;
    if (!to || !subject || !html) {
      return res.status(400).json({ message: "Champs manquants : to, subject ou html" });
    }
    const recipients = Array.isArray(to) ? to : [to];
    for (const mail of recipients) {
      await emailService.sendMailToUser(mail, subject, html, "", attachments);
    }
    res.status(200).json({ message: "Emails envoyés avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi des mails :", error);
    res.status(500).json({ message: "Échec de l'envoi des emails", error: error.message });
  }
};
