const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

// Constantes pour les messages et codes d'erreur
const ERROR_MESSAGES = {
  NO_TOKEN: { message: "Accès refusé. Aucun token fourni.", code: "NO_TOKEN" },
  INVALID_TOKEN: { message: "Token invalide.", code: "INVALID_TOKEN" },
  USER_NOT_FOUND: { message: "Utilisateur non trouvé.", code: "USER_NOT_FOUND" },
  ACCOUNT_INACTIVE: { message: "Compte inactif.", code: "ACCOUNT_INACTIVE" },
  INSUFFICIENT_PERMISSIONS: { message: "Permissions insuffisantes.", code: "INSUFFICIENT_PERMISSIONS" },
  AUTH_REQUIRED: { message: "Authentification requise.", code: "AUTH_REQUIRED" },
  PERMISSION_REFUSED: (permissionName) => ({
    message: `Permission refusée. Vous n'avez pas la permission "${permissionName}".`,
    code: "PERMISSION_REFUSED",
  }),
};

// Middleware pour vérifier l'utilisateur
module.exports.checkUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.jwt;
    if (!token) {
      res.locals.user = null;
      return next();
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        return next();
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: decodedToken.id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            phone: true,
            profilePic: true,
            permissions: { select: { name: true } },
          },
        });

        if (user && user.status === "ACTIVE") {
          res.locals.user = user;
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
        } else {
          res.locals.user = null;
        }
        return next();
      } catch (dbError) {
        console.error("Erreur de base de données dans checkUser:", dbError);
        res.locals.user = null;
        return next();
      }
    });
  } catch (error) {
    console.error("Erreur dans checkUser:", error);
    res.locals.user = null;
    return next();
  }
};

module.exports.requireAuth = (req, res, next) => {

  // const token = req.cookies.jwt || req.headers.authorization?.replace("Bearer ", "");
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.jwt;
  console.log(token);
  console.log("token");
  
  if (!token) {
    return res.status(401).json(ERROR_MESSAGES.NO_TOKEN);
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
    if (err) {
      console.error("Erreur de vérification JWT:", err);
      return res.status(401).json(ERROR_MESSAGES.INVALID_TOKEN);
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          phone: true,
          profilePic: true,
          permissions: { select: { name: true } },
        },
      });

      if (!user) {
        return res.status(401).json(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (user.status !== "ACTIVE") {
        return res.status(403).json(ERROR_MESSAGES.ACCOUNT_INACTIVE);
      }

      res.locals.user = user;
      next();
    } catch (dbError) {
      console.error("Erreur de base de données dans requireAuth:", dbError);
      return res.status(500).json({
        message: "Erreur interne du serveur.",
        code: "DATABASE_ERROR",
      });
    }
  });
  
};

module.exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!res.locals.user) {
      return res.status(401).json(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    const userRole = res.locals.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      createAuditLog({
        userId: res.locals.user.id,
        action: "TENTATIVE_ACCES_NON_AUTORISEE",
        resource: req.originalUrl,
        details: { rolesRequis: allowedRoles, roleUtilisateur: userRole },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return res.status(403).json({
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS.message,
        code: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS.code,
        required: allowedRoles,
        current: userRole,
      });
    }
    next();
  };
};

module.exports.requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!res.locals.user) {
      return res.status(401).json(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    const hasPermission = res.locals.user.permissions.some(
      (permission) => permission.name === permissionName
    );

    if (!hasPermission) {
      createAuditLog({
        userId: res.locals.user.id,
        action: "PERMISSION_REFUSEE",
        resource: permissionName,
        details: {
          permissionRequise: permissionName,
          permissionsUtilisateur: res.locals.user.permissions.map((p) => p.name),
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return res.status(403).json(ERROR_MESSAGES.PERMISSION_REFUSED(permissionName));
    }
    next();
  };
};
