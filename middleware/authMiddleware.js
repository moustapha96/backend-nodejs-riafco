// const jwt = require("jsonwebtoken");
// const { PrismaClient } = require("@prisma/client");
// const { createAuditLog } = require("../utils/audit");
// const prisma = new PrismaClient();

// // Constantes pour les messages et codes d'erreur
// const ERROR_MESSAGES = {
//   NO_TOKEN: { message: "Accès refusé. Aucun token fourni.", code: "NO_TOKEN" },
//   INVALID_TOKEN: { message: "Token invalide.", code: "INVALID_TOKEN" },
//   USER_NOT_FOUND: { message: "Utilisateur non trouvé.", code: "USER_NOT_FOUND" },
//   ACCOUNT_INACTIVE: { message: "Compte inactif.", code: "ACCOUNT_INACTIVE" },
//   INSUFFICIENT_PERMISSIONS: { message: "Permissions insuffisantes.", code: "INSUFFICIENT_PERMISSIONS" },
//   AUTH_REQUIRED: { message: "Authentification requise.", code: "AUTH_REQUIRED" },
//   PERMISSION_REFUSED: (permissionName) => ({
//     message: `Permission refusée. Vous n'avez pas la permission "${permissionName}".`,
//     code: "PERMISSION_REFUSED",
//   }),
// };

// // Middleware pour vérifier l'utilisateur
// module.exports.checkUser = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.jwt;
//     if (!token) {
//       res.locals.user = null;
//       return next();
//     }

//     jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
//       if (err) {
//         res.locals.user = null;
//         return next();
//       }

//       try {
//         const user = await prisma.user.findUnique({
//           where: { id: decodedToken.id },
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             role: true,
//             status: true,
//             phone: true,
//             profilePic: true,
//             permissions: { select: { name: true } },
//           },
//         });

//         if (user && user.status === "ACTIVE") {
//           res.locals.user = user;
//           await prisma.user.update({
//             where: { id: user.id },
//             data: { lastLogin: new Date() },
//           });
//         } else {
//           res.locals.user = null;
//         }
//         return next();
//       } catch (dbError) {
//         console.error("Erreur de base de données dans checkUser:", dbError);
//         res.locals.user = null;
//         return next();
//       }
//     });
//   } catch (error) {
//     console.error("Erreur dans checkUser:", error);
//     res.locals.user = null;
//     return next();
//   }
// };

// // Middleware pour exiger une authentification
// module.exports.requireAuth = (req, res, next) => {
//   const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.jwt;
//   if (!token) {
//     return res.status(401).json(ERROR_MESSAGES.NO_TOKEN);
//   }

//   jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
//     if (err) {
//       console.error("Erreur de vérification JWT:", err);
//       return res.status(401).json(ERROR_MESSAGES.INVALID_TOKEN);
//     }

//     try {
//       const user = await prisma.user.findUnique({
//         where: { id: decodedToken.id },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           status: true,
//           phone: true,
//           profilePic: true,
//           permissions: { select: { name: true } },
//         },
//       });

//       if (!user) {
//         return res.status(401).json(ERROR_MESSAGES.USER_NOT_FOUND);
//       }

//       if (user.status !== "ACTIVE") {
//         return res.status(403).json(ERROR_MESSAGES.ACCOUNT_INACTIVE);
//       }

//       res.locals.user = user;
//       next();
//     } catch (dbError) {
//       console.error("Erreur de base de données dans requireAuth:", dbError);
//       return res.status(500).json({
//         message: "Erreur interne du serveur.",
//         code: "DATABASE_ERROR",
//       });
//     }
//   });
// };

// // Middleware pour exiger un rôle spécifique
// module.exports.requireRole = (roles) => {
//   return (req, res, next) => {
//     if (!res.locals.user) {
//       return res.status(401).json(ERROR_MESSAGES.AUTH_REQUIRED);
//     }

//     const userRole = res.locals.user.role;
//     const allowedRoles = Array.isArray(roles) ? roles : [roles];

//     if (!allowedRoles.includes(userRole)) {
//       createAuditLog({
//         userId: res.locals.user.id,
//         action: "TENTATIVE_ACCES_NON_AUTORISEE",
//         resource: req.originalUrl,
//         details: { rolesRequis: allowedRoles, roleUtilisateur: userRole },
//         ipAddress: req.ip,
//         userAgent: req.get("User-Agent"),
//       });
//       return res.status(403).json({
//         message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS.message,
//         code: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS.code,
//         required: allowedRoles,
//         current: userRole,
//       });
//     }
//     next();
//   };
// };

// // Middleware pour exiger une permission spécifique
// module.exports.requirePermission = (permissionName) => {
//   return (req, res, next) => {
//     if (!res.locals.user) {
//       return res.status(401).json(ERROR_MESSAGES.AUTH_REQUIRED);
//     }

//     const hasPermission = res.locals.user.permissions.some(
//       (permission) => permission.name === permissionName
//     );

//     if (!hasPermission) {
//       createAuditLog({
//         userId: res.locals.user.id,
//         action: "PERMISSION_REFUSEE",
//         resource: permissionName,
//         details: {
//           permissionRequise: permissionName,
//           permissionsUtilisateur: res.locals.user.permissions.map((p) => p.name),
//         },
//         ipAddress: req.ip,
//         userAgent: req.get("User-Agent"),
//       });
//       return res.status(403).json(ERROR_MESSAGES.PERMISSION_REFUSED(permissionName));
//     }
//     next();
//   };
// };

const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const { createAuditLog } = require("../utils/audit")

const prisma = new PrismaClient()


module.exports.checkUser = async (req, res, next) => {
  try {
  
    const token =
  req.headers.authorization?.replace("Bearer ", "") ||
  req.cookies.jwt

    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
        if (err) {
          res.locals.user = null
          return next() // Assure-toi que next() est appelé
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
              permissions: {
                select: {
                  name: true,
                },
              },
            },
          })
          if (user && user.status === "ACTIVE") {
            res.locals.user = user
            await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
          } else {
            res.locals.user = null
          }
          return next() // Assure-toi que next() est appelé
        } catch (dbError) {
          console.error("Database error in checkUser:", dbError)
          res.locals.user = null
          return next() // Assure-toi que next() est appelé
        }
      })
    } else {
      res.locals.user = null
      return next() // Assure-toi que next() est appelé
    }
  } catch (error) {
    console.error("Error in checkUser middleware:", error)
    res.locals.user = null
    return next() // Assure-toi que next() est appelé
  }
}


module.exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.jwt

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
      code: "NO_TOKEN",
    })
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
    if (err) {
      console.error("JWT verification error:", err)
      return res.status(401).json({
        message: "Invalid token.",
        code: "INVALID_TOKEN",
      })
    }
  
    console.log("ID décodé :", decodedToken.id);
  const user = await prisma.user.findUnique({
    where: { id: decodedToken.id },
  });
    console.log("Utilisateur trouvé :", user);
    
  
  
    console.log("Decoded token:", decodedToken); // 👈 log ici
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
          permissions: {
            select: {
              name: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(401).json({
          message: "User not found.",
          code: "USER_NOT_FOUND",
        })
      }

      if (user.status !== "ACTIVE") {
        return res.status(403).json({
          message: "Account is inactive.",
          code: "ACCOUNT_INACTIVE",
        })
      }

      res.locals.user = user
      next()
    } catch (dbError) {
      console.error("Database error in requireAuth:", dbError)
      return res.status(500).json({
        message: "Internal server error.",
        code: "DATABASE_ERROR",
      })
    }
  })
}

module.exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!res.locals.user) {
      return res.status(401).json({
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      })
    }

    const userRole = res.locals.user.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(userRole)) {
      // Log unauthorized access attempt
      createAuditLog({
        userId: res.locals.user.id,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resource: req.originalUrl,
        details: { requiredRoles: allowedRoles, userRole },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      })

      return res.status(403).json({
        message: "Insufficient permissions.",
        code: "INSUFFICIENT_PERMISSIONS",
        required: allowedRoles,
        current: userRole,
      })
    }

    next()
  }
}

// module.exports.requirePermission = (resource, action) => {
//   return (req, res, next) => {
//     if (!res.locals.user) {
//       return res.status(401).json({
//         message: "Authentication required.",
//         code: "AUTH_REQUIRED",
//       })
//     }

//     const userRole = res.locals.user.role
//     const permissions = getPermissions(userRole)
//     if (!hasPermission(permissions, resource, action)) {
//       createAuditLog({
//         userId: res.locals.user.id,
//         action: "PERMISSION_DENIED",
//         resource: `${resource}:${action}`,
//         details: { userRole, resource, action },
//         ipAddress: req.ip,
//         userAgent: req.get("User-Agent"),
//       })

//       return res.status(403).json({
//         message: `Permission denied for ${action} on ${resource}.`,
//         code: "PERMISSION_DENIED",
//       })
//     }
//     next()
//   }
// }


// Middleware pour exiger une permission spécifique


module.exports.requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!res.locals.user) {
      return res.status(401).json({
        message: "Authentification requise.",
        code: "AUTH_REQUIRED",
      });
    }
    // Vérifie si l'utilisateur a la permission demandée
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
          permissionsUtilisateur: res.locals.user.permissions.map(p => p.name),
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return res.status(403).json({
        message: `Permission refusée. Vous n'avez pas la permission "${permissionName}".`,
        code: "PERMISSION_REFUSEE",
      });
    }
    next();
  };
};


// Fonction pour obtenir les permissions d'un rôle
function getPermissions(role) {
  const permissions = {
    ADMIN: {
      utilisateurs: ["lire", "créer", "modifier", "supprimer"],
      activités: ["lire", "créer", "modifier", "supprimer"],
      ressources: ["lire", "créer", "modifier", "supprimer"],
      bureaux: ["lire", "créer", "modifier", "supprimer"],
      actualités: ["lire", "créer", "modifier", "supprimer"],
      partenariats: ["lire", "créer", "modifier", "supprimer"],
      événements: ["lire", "créer", "modifier", "supprimer"],
      newsletters: ["lire", "créer", "modifier", "supprimer"],
      espaceÀPropos: ["lire", "modifier"],
    },
    GESTIONNAIRE: {
      utilisateurs: ["lire", "créer", "modifier"],
      activités: ["lire", "créer", "modifier", "supprimer"],
      ressources: ["lire", "créer", "modifier", "supprimer"],
      bureaux: ["lire", "créer", "modifier", "supprimer"],
      actualités: ["lire", "créer", "modifier", "supprimer"],
      partenariats: ["lire", "créer", "modifier"],
      événements: ["lire", "créer", "modifier", "supprimer"],
      newsletters: ["lire", "créer", "modifier"],
      espaceÀPropos: ["lire", "modifier"],
    },
    RESPONSABLE_ACTIVITES: {
      activités: ["lire", "créer", "modifier", "supprimer"],
      événements: ["lire", "créer", "modifier", "supprimer"],
      actualités: ["lire", "créer", "modifier"],
    },
    RESPONSABLE_RESSOURCES: {
      ressources: ["lire", "créer", "modifier", "supprimer"],
      bureaux: ["lire", "créer", "modifier", "supprimer"],
    },
    RESPONSABLE_COMMUNICATION: {
      actualités: ["lire", "créer", "modifier", "supprimer"],
      newsletters: ["lire", "créer", "modifier", "supprimer"],
      espaceÀPropos: ["lire", "modifier"],
    },
    MEMBER: {
      activités: ["lire"],
      ressources: ["lire"],
      bureaux: ["lire"],
      actualités: ["lire"],
      partenariats: ["lire"],
      événements: ["lire"],
      newsletters: ["lire"],
      espaceÀPropos: ["lire"],
    },
  };
  return permissions[role] || {};
}

function hasPermission(permissions, resource, action) {
  return permissions[resource] && permissions[resource].includes(action)
}
