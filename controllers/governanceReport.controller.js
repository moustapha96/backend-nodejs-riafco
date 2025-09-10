const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

module.exports.getAllGovernanceReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);

    const [reports, total] = await Promise.all([
      prisma.governanceReport.findMany({
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
        },
      }),
      prisma.governanceReport.count(),
    ]);

    res.status(200).json({
      reports,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Get all governance reports error:", error);
    res.status(500).json({
      message: "Failed to retrieve governance reports",
      code: "GET_GOVERNANCE_REPORTS_ERROR",
    });
  }
};

module.exports.getGovernanceReport = async (req, res) => {
  try {
    const report = await prisma.governanceReport.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        message: "Governance report not found",
        code: "GOVERNANCE_REPORT_NOT_FOUND",
      });
    }

    res.status(200).json({ report });
  } catch (error) {
    console.error("Get governance report error:", error);
    res.status(500).json({
      message: "Failed to retrieve governance report",
      code: "GET_GOVERNANCE_REPORT_ERROR",
    });
  }
};

module.exports.createGovernanceReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { title_fr, title_en, paragraphe_fr, paragraphe_en, publishedAt } = req.body;
    const createdById = res.locals.user.id;

    // Gestion du fichier PDF
    let fileUrl = null;
    if (req.file) {
        fileUrl = `/reports/${req.file.filename}`
    }

    const report = await prisma.governanceReport.create({
      data: {
        title_fr: title_fr.trim(),
        title_en: title_en.trim(),
        paragraphe_fr: paragraphe_fr?.trim(),
        paragraphe_en: paragraphe_en?.trim(),
        fileUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: createdById,
      action: "GOVERNANCE_REPORT_CREATED",
      resource: "governance_reports",
      resourceId: report.id,
      details: { title_fr: report.title_fr },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "Governance report created successfully",
      report,
    });
  } catch (error) {
    console.log(error)
    // console.error("Create governance report error:", error);
    res.status(500).json({
      message: "Failed to create governance report",
      code: "CREATE_GOVERNANCE_REPORT_ERROR",
    });
  }
};

module.exports.updateGovernanceReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { title_fr, title_en, paragraphe_fr, paragraphe_en, publishedAt } = req.body;

    const existingReport = await prisma.governanceReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return res.status(404).json({
        message: "Governance report not found",
        code: "GOVERNANCE_REPORT_NOT_FOUND",
      });
    }

    const updateData = {
      title_fr: title_fr?.trim(),
      title_en: title_en?.trim(),
      paragraphe_fr: paragraphe_fr?.trim(),
      paragraphe_en: paragraphe_en?.trim(),
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    };


    // Gestion du fichier PDF
    if (req.file) {
      updateData.fileUrl = `/reports/${req.file.filename}`  
    }

    // Supprimer les champs non définis
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedReport = await prisma.governanceReport.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "GOVERNANCE_REPORT_UPDATED",
      resource: "governance_reports",
      resourceId: id,
      details: { changes: updateData },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Governance report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Update governance report error:", error);
    res.status(500).json({
      message: "Failed to update governance report",
      code: "UPDATE_GOVERNANCE_REPORT_ERROR",
    });
  }
};

module.exports.deleteGovernanceReport = async (req, res) => {
  try {
    const { id } = req.params;

    const existingReport = await prisma.governanceReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return res.status(404).json({
        message: "Governance report not found",
        code: "GOVERNANCE_REPORT_NOT_FOUND",
      });
    }

    await prisma.governanceReport.delete({
      where: { id },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "GOVERNANCE_REPORT_DELETED",
      resource: "governance_reports",
      resourceId: id,
      details: { title_fr: existingReport.title_fr },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Governance report deleted successfully",
    });
  } catch (error) {
    console.error("Delete governance report error:", error);
    res.status(500).json({
      message: "Failed to delete governance report",
      code: "DELETE_GOVERNANCE_REPORT_ERROR",
    });
  }
};
