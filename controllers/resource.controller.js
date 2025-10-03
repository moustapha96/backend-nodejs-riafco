const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const { logAudit, createAuditLog } = require("../utils/audit");
const prisma = new PrismaClient();

// 1. Récupérer toutes les ressources (avec pagination et filtres)
const getAllResources = async(req, res) => {
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
const getResource = async(req, res) => {
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
const downloadResource = async(req, res) => {
    try {
        const { id } = req.params;
        const resource = await prisma.resource.findUnique({ where: { id } });
        if (!resource || !resource.filePath) {
            return res.status(404).json({
                success: false,
                message: "Resource or file not found",
            });
        }
        const filePath = path.join(process.cwd(), resource.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "File not found" });
        }
        res.setHeader("Content-Type", resource.fileType || "application/octet-stream");
        res.setHeader("Content-Disposition", `inline; filename="${resource.fileName}"`);
        res.sendFile(filePath);


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
const createResource = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }
        const { title, description, categoryId, isPublic, tags, lien = null } = req.body;

        // Fichiers (avec upload.fields)
        const file = req.files.file[0] || null;
        const cover = req.files.couverture[0] || null;




        const filePath = file ? file.path.replace(process.cwd(), "").replace(/\\/g, "/") : null;
        const fileName = file ? `/resources/${file.filename}` : null;
        const couverture = cover ? `/resources/${cover.filename}` : null;

        const resource = await prisma.resource.create({
            data: {
                title,
                description,
                lien,
                couverture, // <- maintenant bien alimenté
                filePath, // chemin relatif enregistré
                fileName,
                fileType: file.mimetype,
                fileSize: file.size,
                categoryId,
                authorId: res.locals.user.id,
                isPublic: Boolean(isPublic) || true,
                tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
                url: `/resources${filePath.replace("uploads", "")}`,
            },
        });

        await createAuditLog({
            userId: res.locals.user.id,
            action: "CREATE",
            resource: "Resource",
            resourceId: resource.id,
            data: { title },
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });


        res.status(201).json({
            success: true,
            message: "Resource created successfully",
            data: resource,
        });
    } catch (error) {
        console.error("Create resource error:", error);
        if (req.file) {
            const filePath = path.join(__dirname, "uploads/resources", req.file.path);
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
const updateResource = async(req, res) => {
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
        const { title, description, categoryId, tags, isPublic, lien } = req.body;

        const existingResource = await prisma.resource.findUnique({ where: { id } });
        if (!existingResource) {
            console.error(existingResource);
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }
        let publis_id = Boolean(isPublic) || existingResource.isPublic;


        const updateData = {
            title,
            lien: lien || existingResource.lien,
            description,
            categoryId,
            isPublic: publis_id,
            tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
        };

        const file = req.files.file[0] || null;
        const cover = req.files.couverture[0] || null;

        if (cover) {
            updateData.couverture = `/resources/${cover.filename}`;
        }

        if (file) {
            // Supprime l'ancien fichier si présent
            if (existingResource.filePath) {
                const oldFilePath = path.join(process.cwd(), existingResource.filePath);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            }

            const newFilePath = file.path.replace(process.cwd(), "").replace(/\\/g, "/");
            updateData.filePath = newFilePath;
            updateData.fileName = `/resources/${file.filename}`;
            updateData.fileType = file.mimetype;
            updateData.fileSize = file.size;
            updateData.url = `/resources${newFilePath.replace("uploads", "")}`;
        }

        // if (file) {
        //     nameFile = req.file.filename ? `/resources/${req.file.filename}` : existingResource.fileName;
        //     if (existingResource.filePath) {
        //         const oldFilePath = path.join(process.cwd(), existingResource.filePath);
        //         if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        //     }
        //     const newFilePath = file.path.replace(process.cwd(), "").replace(/\\/g, "/"); // Chemin relatif
        //     updateData.filePath = newFilePath;
        //     updateData.fileName = nameFile;
        //     updateData.fileType = file.mimetype;
        //     updateData.fileSize = file.size;
        //     updateData.url = `/resources${newFilePath.replace("uploads", "")}`;
        // }



        const resource = await prisma.resource.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: res.locals.user.id,
            action: "UPDATE",
            resource: "Resource",
            resourceId: resource.id,
            data: updateData,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

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
const deleteResource = async(req, res) => {
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

        await createAuditLog({
            userId: res.locals.user.id,
            action: "DELETE",
            resource: "Resource",
            resourceId: id,
            data: { title: resource.title },
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });


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
const getAllCategories = async(req, res) => {
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
// const createCategory = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: errors.array(),
//       });
//     }
//     const { name, description } = req.body;
//     const category = await prisma.resourceCategory.create({
//       data: { name, description },
//     });

//     await logAudit(req.user.id, "CREATE", "Category", category.id, { name }, req.ip, req.get("User-Agent"));
//     res.status(201).json({
//       success: true,
//       message: "Category created successfully",
//       data: category,
//     });
//   } catch (error) {
//     console.error("Create category error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating category",
//       error: error.message,
//     });
//   }
// };
const createCategory = async(req, res) => {
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

        // Vérifie si une catégorie avec ce nom existe déjà
        const existingCategory = await prisma.resourceCategory.findUnique({
            where: { name },
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "A category with this name already exists",
            });
        }

        // Si elle n'existe pas, crée-la
        const category = await prisma.resourceCategory.create({
            data: { name, description },
        });

        await createAuditLog({
            action: "CREATE",
            resource: "Category",
            details: { name, description },
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        });

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
const updateCategory = async(req, res) => {
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


        await createAuditLog({
            action: "UPDATE",
            resource: "Category" + category.id,
            details: { name, description },
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        });

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
const deleteCategory = async(req, res) => {
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

        await createAuditLog({
            action: "DELETE",
            resource: "Category" + category.id,
            details: { name: category.name, description: category.description },
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        });


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