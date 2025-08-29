const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const emailService = require("../services/email.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Constantes
const maxAge = process.env.JWT_EXPIRES_IN || "7d";
const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12;

// Fonction utilitaire pour créer un token JWT
const createToken = (id) => {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET n'est pas défini dans le fichier .env");
  }
  return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: maxAge });
};

// Inscription d'un nouvel utilisateur
module.exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Erreurs de validation", errors: errors.array() });
    }

    const { firstName, lastName, email, password, role = "MEMBER" } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé", code: "EMAIL_EXISTS" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        profilePic: req.file ? `/uploads/profiles/${req.file.filename}` : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        profilePic: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "INSCRIPTION_UTILISATEUR",
      resource: "users",
      resourceId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error("Échec de l'envoi de l'email de bienvenue:", emailError);
    }

    const token = createToken(user.id);
    const cookieOptions = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({ message: "Inscription réussie", user, token });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({ message: "Échec de l'inscription", code: "REGISTRATION_ERROR" });
  }
};

// Connexion d'un utilisateur
module.exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Erreurs de validation", errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      await createAuditLog({
        action: "ECHEC_CONNEXION",
        resource: "auth",
        details: { email, reason: "Utilisateur non trouvé" },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return res.status(401).json({ message: "Identifiants invalides", code: "INVALID_CREDENTIALS" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await createAuditLog({
        userId: user.id,
        action: "ECHEC_CONNEXION",
        resource: "auth",
        details: { email, reason: "Mot de passe invalide" },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return res.status(401).json({ message: "Identifiants invalides", code: "INVALID_CREDENTIALS" });
    }

    if (user.status !== "ACTIVE") {
      await createAuditLog({
        userId: user.id,
        action: "ECHEC_CONNEXION",
        resource: "auth",
        details: { email, reason: "Compte inactif" },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return res.status(403).json({ message: "Compte inactif", code: "ACCOUNT_INACTIVE" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await createAuditLog({
      userId: user.id,
      action: "CONNEXION_REUSSIE",
      resource: "auth",
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const token = createToken(user.id);
    const cookieOptions = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("jwt", token, cookieOptions);
    res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePic: user.profilePic,
        phone: user.phone,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ message: "Échec de la connexion", code: "LOGIN_ERROR" });
  }
};

// Déconnexion
module.exports.logout = async (req, res) => {
  try {
    const userId = res.locals.user?.id;
    if (userId) {
      await createAuditLog({
        userId,
        action: "DECONNEXION",
        resource: "auth",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }
    res.cookie("jwt", "", {
      maxAge: 1,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
    res.status(500).json({ message: "Échec de la déconnexion", code: "LOGOUT_ERROR" });
  }
};


module.exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: res.locals.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        permissions: true,
        profilePic: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      message: "Failed to get profile",
      code: "PROFILE_ERROR",
    })
  }
}

module.exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { firstName, lastName } = req.body
    const userId = res.locals.user.id

    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    }

    if (req.file) {
      updateData.profilePic = `/uploads/profiles/${req.file.filename}`
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        profilePic: true,
        updatedAt: true,
      },
    })

    await createAuditLog({
      userId,
      action: "PROFILE_UPDATED",
      resource: "users",
      resourceId: userId,
      details: updateData,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      message: "Failed to update profile",
      code: "UPDATE_PROFILE_ERROR",
    })
  }
}

module.exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { currentPassword, newPassword } = req.body
    const userId = res.locals.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
        code: "INVALID_CURRENT_PASSWORD",
      })
    }

    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    })

    await createAuditLog({
      userId,
      action: "PASSWORD_CHANGED",
      resource: "users",
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({
      message: "Failed to change password",
      code: "CHANGE_PASSWORD_ERROR",
    })
  }
}

module.exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if email exists or not
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken)
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError)
      return res.status(500).json({
        message: "Failed to send reset email",
        code: "EMAIL_SEND_ERROR",
      })
    }

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      resource: "auth",
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      message: "Failed to process request",
      code: "FORGOT_PASSWORD_ERROR",
    })
  }
}

module.exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { token, newPassword } = req.body

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
      })
    }

    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_COMPLETED",
      resource: "auth",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      message: "Failed to reset password",
      code: "RESET_PASSWORD_ERROR",
    })
  }
}
