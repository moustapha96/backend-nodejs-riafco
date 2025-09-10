const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

module.exports.getAboutUs = async (req, res) => {
  try {
    const aboutUs = await prisma.aboutUs.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!aboutUs) {
      return res.status(404).json({
        message: "About Us content not found",
        code: "ABOUT_US_NOT_FOUND",
      });
    }
    res.status(200).json({ aboutUs });
  } catch (error) {
    console.error("Get About Us error:", error);
    res.status(500).json({
      message: "Failed to retrieve About Us content",
      code: "GET_ABOUT_US_ERROR",
    });
  }
};

module.exports.getAboutUsAll = async (req, res) => {
  try {

    const { page = 1, limit = 10, search } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const where = {}
  
    if (search) {
      where.OR = [
        { titre_fr: { contains: search, mode: "insensitive" } },
        { titre_en: { contains: search, mode: "insensitive" } },
      ]
    }

     const [aboutUs, total] = await Promise.all([
      prisma.aboutUs.findMany({
        where,
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.aboutUs.count({ where }),
     ])
     res.json({
      success: true,
      data: aboutUs,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get About Us error:", error);
    res.status(500).json({
      message: "Failed to retrieve About Us content",
      code: "GET_ABOUT_US_ERROR",
    });
  }
};


module.exports.createAboutUs = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { title_fr, title_en, paragraphe_fr, paragraphe_en } = req.body;

    // Gestion de l'image
    let imagePath = null;
    if (req.file) {
      imagePath = `/about-us/${req.file.filename}`;
    }

    const aboutUs = await prisma.aboutUs.create({
      data: {
        title_fr: title_fr?.trim(),
        title_en: title_en?.trim(),
        paragraphe_fr: paragraphe_fr?.trim(),
        paragraphe_en: paragraphe_en?.trim(),
        image: imagePath,
      },
    });

    res.status(201).json({
      message: "About Us content created successfully",
      aboutUs,
    });
  } catch (error) {
    console.error("Create About Us error:", error);
    res.status(500).json({
      message: "Failed to create About Us content",
      code: "CREATE_ABOUT_US_ERROR",
    });
  }
};

module.exports.updateAboutUs = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { title_fr, title_en, paragraphe_fr, paragraphe_en, isPublished } = req.body;

    const existingAboutUs = await prisma.aboutUs.findUnique({
      where: { id },
    });

    if (!existingAboutUs) {
      return res.status(404).json({
        message: "About Us content not found",
        code: "ABOUT_US_NOT_FOUND",
      });
    }

    const updateData = {
      title_fr: title_fr?.trim(),
      title_en: title_en?.trim(),
      paragraphe_fr: paragraphe_fr?.trim(),
      paragraphe_en: paragraphe_en?.trim(),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
    };

    if (req.file) {
      updateData.image = `/about-us/${req.file.filename}`;
    }

    
    // Supprimer les champs non définis
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedAboutUs = await prisma.aboutUs.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "About Us content updated successfully",
      aboutUs: updatedAboutUs,
    });
  } catch (error) {
    console.error("Update About Us error:", error);
    res.status(500).json({
      message: "Failed to update About Us content",
      code: "UPDATE_ABOUT_US_ERROR",
    });
  }
};

module.exports.deleteAboutUsImage = async (req, res) => {
  try {
    const { id } = req.params;
    const aboutUs = await prisma.aboutUs.findUnique({
      where: { id },
    });

    if (!aboutUs) {
      return res.status(404).json({
        message: "About Us content not found",
        code: "ABOUT_US_NOT_FOUND",
      });
    }

    if (!aboutUs.image) {
      return res.status(400).json({
        message: "No image to delete",
        code: "NO_IMAGE_TO_DELETE",
      });
    }

    // Supprimer le fichier physique
    const imagePath = path.join(__dirname, "../../", aboutUs.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const updatedAboutUs = await prisma.aboutUs.update({
      where: { id },
      data: { image: null },
    });

    res.status(200).json({
      message: "About Us image deleted successfully",
      aboutUs: updatedAboutUs,
    });
  } catch (error) {
    console.error("Delete About Us image error:", error);
    res.status(500).json({
      message: "Failed to delete About Us image",
      code: "DELETE_ABOUT_US_IMAGE_ERROR",
    });
  }
};
