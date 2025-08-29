const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const { logAudit } = require("../utils/audit");
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

    const { siteName, contactEmail, socialMedia, footer } = req.body;
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

    await logAudit(req.user.id, "UPDATE", "SiteSettings", updatedSettings.id, updateData, req.ip, req.get("User-Agent"));
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

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};
