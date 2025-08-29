const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const { logAudit, createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

// 1. Récupérer tous les éléments d'historique (avec pagination et filtres)
const getAllHistoryItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    const [historyItems, total] = await Promise.all([
      prisma.historyItem.findMany({
        where,
        skip,
        take: Number.parseInt(limit),
        orderBy: { date: "desc" },
      }),
      prisma.historyItem.count({ where }),
    ]);
    res.json({
      success: true,
      data: historyItems,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get history items error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching history items",
      error: error.message,
    });
  }
};

// 2. Récupérer un élément d'historique par ID
const getHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const historyItem = await prisma.historyItem.findUnique({
      where: { id },
    });
    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: "History item not found",
      });
    }
    res.json({
      success: true,
      data: historyItem,
    });
  } catch (error) {
    console.error("Get history item error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching history item",
      error: error.message,
    });
  }
};

// 3. Créer un nouvel élément d'historique
const createHistoryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { date, title, description } = req.body;

    const historyItem = await prisma.historyItem.create({
      data: {
        date: new Date(date),
        title,
        description
      },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "CREATE",
      entity: "HistoryItem",
      entityId: historyItem.id,
      changes: { title },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(201).json({
      success: true,
      message: "History item created successfully",
      data: historyItem,
    });
  } catch (error) {
    console.error("Create history item error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating history item",
      error: error.message,
    });
  }
};

// 4. Mettre à jour un élément d'historique
const updateHistoryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { id } = req.params;
    const { date, title, description } = req.body;


    const existingHistoryItem = await prisma.historyItem.findUnique({ where: { id } });
    if (!existingHistoryItem) {
      return res.status(404).json({
        success: false,
        message: "History item not found",
      });
    }

    const updateData = {
      date: new Date(date),
      title,
      description,
    };

    // Gestion de l'image
    const historyItem = await prisma.historyItem.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "UPDATE",
      entity: "HistoryItem",
      entityId: historyItem.id,
      changes: updateData,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.json({
      success: true,
      message: "History item updated successfully",
      data: historyItem,
    });
  } catch (error) {
    console.error("Update history item error:", error);
    // Supprimer les nouveaux fichiers en cas d'erreur
    res.status(500).json({
      success: false,
      message: "Error updating history item",
      error: error.message,
    });
  }
};

// 5. Supprimer un élément d'historique
const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const historyItem = await prisma.historyItem.findUnique({ where: { id } });
    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: "History item not found",
      });
    }

    await prisma.historyItem.delete({ where: { id } });
    await createAuditLog({
      userId: res.locals.user.id,
      action: "DELETE",
      entity: "HistoryItem",
      entityId: id,
      changes: { title: historyItem.title },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.json({
      success: true,
      message: "History item deleted successfully",
    });
  } catch (error) {
    console.error("Delete history item error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting history item",
      error: error.message,
    });
  }
};

module.exports = {
  getAllHistoryItems,
  getHistoryItem,
  createHistoryItem,
  updateHistoryItem,
  deleteHistoryItem,
};
