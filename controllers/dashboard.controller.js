const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Récupérer les statistiques du dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalActivities,
      totalEvents,
      totalResources,
      totalPartners,
      totalContacts,
      totalNews,
      activeUsers,
      draftActivities,
      publishedActivities,
      upcomingEvents,
      pastEvents,
      pendingContacts,
      publishedNews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.activity.count(),
      prisma.event.count(),
      prisma.resource.count(),
      prisma.partner.count(),
      prisma.contact.count(),
      prisma.news.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.activity.count({ where: { status: "DRAFT" } }),
      prisma.activity.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count({ where: { startDate: { gte: new Date() } } }),
      prisma.event.count({ where: { endDate: { lt: new Date() } } }),
      prisma.contact.count({ where: { status: "PENDING" } }),
      prisma.news.count({ where: { status: "PUBLISHED" } }),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        activities: {
          total: totalActivities,
          draft: draftActivities,
          published: publishedActivities,
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          past: pastEvents,
        },
        resources: totalResources,
        partners: totalPartners,
        contacts: {
          total: totalContacts,
          pending: pendingContacts,
        },
        news: {
          total: totalNews,
          published: publishedNews,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

// 2. Récupérer les activités récentes
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const recentActivities = await prisma.activity.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });
    res.json({
      success: true,
      data: recentActivities,
    });
  } catch (error) {
    console.error("Get recent activities error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent activities",
      error: error.message,
    });
  }
};

// 3. Récupérer les notifications système
const getSystemNotifications = async (req, res) => {
  try {
    const { limit = 10, type } = req.query;

    // Exemple de notifications système (à adapter selon tes besoins)
    const where = {};
    if (type) {
      where.type = type;
    }

    // Récupérer les notifications (exemple avec des logs d'audit critiques)
    const notifications = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: "DELETE" },
          { action: "UNAUTHORIZED_ACCESS_ATTEMPT" },
          { action: "PERMISSION_DENIED" },
        ],
      },
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: notifications.map((log) => ({
        id: log.id,
        type: "AUDIT",
        message: `${log.user?.firstName || "Unknown"} ${log.user?.lastName || ""} (${log.user?.email || "N/A"}) performed ${log.action} on ${log.resource}#${log.resourceId}`,
        details: log.details,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get system notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system notifications",
      error: error.message,
    });
  }
};

// 4. Récupérer les logs d'audit
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, action, resource, userId, startDate, endDate } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const where = {};
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: auditLogs,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit logs",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getSystemNotifications,
  getAuditLogs,
};
