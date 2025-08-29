const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const { logAudit } = require("../utils/audit");
const prisma = new PrismaClient();

// 1. Récupérer toutes les ressources (avec pagination et filtres)
const getAllResources = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) {
      where.categoryId = category;
    }
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }),
      prisma.resource.count({ where }),
    ]);
    res.json({
      success: true,
      data: resources,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resources",
      error: error.message,
    });
  }
};

// 2. Récupérer une ressource par ID
const getResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
    res.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error("Get resource error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resource",
      error: error.message,
    });
  }
};

// 3. Télécharger un fichier de ressource
const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource || !resource.filePath) {
      return res.status(404).json({
        success: false,
        message: "Resource or file not found",
      });
    }
    const filePath = path.join(__dirname, "../../", resource.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
    res.download(filePath, resource.fileName);
  } catch (error) {
    console.error("Download resource error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading resource",
      error: error.message,
    });
  }
};

// 4. Créer une nouvelle ressource
const createResource = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { title, description, categoryId, tags } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        filePath: file.path.replace(/\\/g, "/"),
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        categoryId,
        tags: tags || [],
      },
    });
    await logAudit(req.user.id, "CREATE", "Resource", resource.id, { title }, req.ip, req.get("User-Agent"));
    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    console.error("Create resource error:", error);
    if (req.file) {
      const filePath = path.join(__dirname, "../../", req.file.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({
      success: false,
      message: "Error creating resource",
      error: error.message,
    });
  }
};

// 5. Mettre à jour une ressource
const updateResource = async (req, res) => {
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
    const { title, description, categoryId, tags } = req.body;
    const file = req.file;
    const existingResource = await prisma.resource.findUnique({ where: { id } });
    if (!existingResource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
    const updateData = {
      title,
      description,
      categoryId,
      tags: tags || [],
    };
    // Gestion du fichier
    if (file) {
      if (existingResource.filePath) {
        const oldFilePath = path.join(__dirname, "../../", existingResource.filePath);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      updateData.filePath = file.path.replace(/\\/g, "/");
      updateData.fileName = file.originalname;
      updateData.fileType = file.mimetype;
      updateData.fileSize = file.size;
    }
    const resource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });
    await logAudit(req.user.id, "UPDATE", "Resource", resource.id, updateData, req.ip, req.get("User-Agent"));
    res.json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    console.error("Update resource error:", error);
    if (req.file) {
      const filePath = path.join(__dirname, "../../", req.file.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({
      success: false,
      message: "Error updating resource",
      error: error.message,
    });
  }
};

// 6. Supprimer une ressource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
    // Supprimer le fichier associé
    if (resource.filePath) {
      const filePath = path.join(__dirname, "../../", resource.filePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.resource.delete({ where: { id } });
    await logAudit(req.user.id, "DELETE", "Resource", id, { title: resource.title }, req.ip, req.get("User-Agent"));
    res.json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting resource",
      error: error.message,
    });
  }
};

// 7. Récupérer toutes les catégories
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.resourceCategory.findMany();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// 8. Créer une nouvelle catégorie
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { name, description } = req.body;
    const category = await prisma.resourceCategory.create({
      data: { name, description },
    });
    await logAudit(req.user.id, "CREATE", "Category", category.id, { name }, req.ip, req.get("User-Agent"));
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// 9. Mettre à jour une catégorie
const updateCategory = async (req, res) => {
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
    const { name, description } = req.body;
    const category = await prisma.resourceCategory.update({
      where: { id },
      data: { name, description },
    });
    await logAudit(req.user.id, "UPDATE", "Category", category.id, { name, description }, req.ip, req.get("User-Agent"));
    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// 10. Supprimer une catégorie
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.resourceCategory.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    await prisma.resourceCategory.delete({ where: { id } });
    await logAudit(req.user.id, "DELETE", "Category", id, { name: category.name }, req.ip, req.get("User-Agent"));
    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

module.exports = {
  getAllResources,
  getResource,
  downloadResource,
  createResource,
  updateResource,
  deleteResource,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
