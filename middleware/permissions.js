// middleware/permissions.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkPermission(permissionName) {
  return async (req, res, next) => {
    const userId = res.locals.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: true },
    });

    const hasPermission = user.permissions.some(
      (permission) => permission.name === permissionName
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "Permission refusée",
        code: "PERMISSION_DENIED",
      });
    }

    next();
  };
}

module.exports = { checkPermission };
