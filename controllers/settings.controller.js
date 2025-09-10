const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const { logAudit, createAuditLog, getAllAuditLogs } = require("../utils/audit");
const { auditLog } = require("../config/db");
const prisma = new PrismaClient();

// 1. Récupérer les paramètres du site
const getSiteSettings = async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      // Si aucun paramètre n'existe, en créer un par défaut
      const defaultSettings = await prisma.siteSettings.create({
        data: {
          siteName: "RIAFCO",
        },
      });
      return res.json({
        success: true,
        data: defaultSettings,
      });
    }
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get site settings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching site settings",
      error: error.message,
    });
  }
};

// 2. Mettre à jour les paramètres du site
const updateSiteSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { siteName, contactEmail, urlSite , socialMedia,
      footer, contactPhone, contactMobile, contactAddress } = req.body;
    const logo = req.files?.logo?.[0];
    const favicon = req.files?.favicon?.[0];

    // Récupérer les paramètres existants
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: "RIAFCO",
        },
      });
    }

    const updateData = {
      siteName: siteName || settings.siteName,
      contactEmail: contactEmail || settings.contactEmail,
      footer: footer || settings.footer,
      contactPhone: contactPhone || settings.contactPhone,
      contactMobile: contactMobile || settings.contactMobile,
      contactAddress: contactAddress || settings.contactAddress,
      urlSite: urlSite || settings.urlSite
    };

    // Mettre à jour les réseaux sociaux si fournis
    if (socialMedia) {
      try {
        updateData.socialMedia = JSON.parse(socialMedia);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Social media must be a valid JSON object",
        });
      }
    } else {
      updateData.socialMedia = settings.socialMedia;
    }

    // Gestion du logo
    if (logo) {
      if (settings.logo) {
        const oldLogoPath = path.join(__dirname, "../../", settings.logo);
        if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
      }
      updateData.logo = logo.path.replace(/\\/g, "/");
    }

    // Gestion du favicon
    if (favicon) {
      if (settings.favicon) {
        const oldFaviconPath = path.join(__dirname, "../../", settings.favicon);
        if (fs.existsSync(oldFaviconPath)) fs.unlinkSync(oldFaviconPath);
      }
      updateData.favicon = favicon.path.replace(/\\/g, "/");
    }

    const updatedSettings = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: updateData,
    });

     await createAuditLog({
      userId: res.locals.user.id,
      action: "UPDATE_SETTINGS",
      resource: "SiteSettings",
      resourceId: updatedSettings.id,
      details: updateData,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
     });
    
    
    res.json({
      success: true,
      message: "Site settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Update site settings error:", error);
    // Supprimer les nouveaux fichiers en cas d'erreur
    if (req.files?.logo?.[0]) {
      const logoPath = path.join(__dirname, "../../", req.files.logo[0].path);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }
    if (req.files?.favicon?.[0]) {
      const faviconPath = path.join(__dirname, "../../", req.files.favicon[0].path);
      if (fs.existsSync(faviconPath)) fs.unlinkSync(faviconPath);
    }
    res.status(500).json({
      success: false,
      message: "Error updating site settings",
      error: error.message,
    });
  }
};

const getAuditLogs = async (req, res) => {
  try {

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

     const [audits, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
        } },
      }),
      prisma.auditLog.count(), // Compte total des éléments
    ]);
    
   res.json({
      success: true,
      data: audits,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total, // Nombre total d'éléments dans la base
        totalPages: Math.ceil(total / Number(limit)),
      },
    });

    } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({
      success: false,
      message: "Error gettings audit log",
      error: error.message,
    });
  }
};


module.exports = {
  getSiteSettings,
  updateSiteSettings,
  getAuditLogs
};
