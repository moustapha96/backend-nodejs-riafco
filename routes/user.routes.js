const router = require("express").Router()
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const userController = require("../controllers/user.controller")
const { requireAuth, requireRole, requirePermission } = require("../middleware/auth.middleware")

// Ensure upload directory exists
const uploadDir = "uploads/profiles"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})


const createUserValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Veuillez fournir un email valide"),
  body("firstName").trim().isLength({ min: 2, max: 50 }).withMessage("Le prénom doit contenir entre 2 et 50 caractères"),
  body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("Le nom doit contenir entre 2 et 50 caractères"),
  body("role").optional().isIn(["ADMIN", "MODERATOR", "MEMBER"]).withMessage("Rôle invalide"),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]).withMessage("Statut invalide"),
  body("phone").optional().isMobilePhone().withMessage("Numéro de téléphone invalide"),
  body("permissions").optional().isArray().withMessage("Les permissions doivent être un tableau"),
  body("permissions.*").optional().isIn([
    "GERER_ACTIVITES",
    "GERER_RESSOURCES",
    "GERER_UTILISATEURS",
    "GERER_BUREAUX",
    "GERER_ACTUALITES",
    "GERER_PARTENARIATS",
    "GERER_EVENEMENTS",
    "GERER_NEWSLETTERS",
    "GERER_ESPACE_APROPOS",
  ]).withMessage("Permission invalide"),
];

const updateUserValidation = [
  body("firstName").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Le prénom doit contenir entre 2 et 50 caractères"),
  body("lastName").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Le nom doit contenir entre 2 et 50 caractères"),
  body("role").optional().isIn(["ADMIN", "MODERATOR", "MEMBER"]).withMessage("Rôle invalide"),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]).withMessage("Statut invalide"),
  body("phone").optional().isMobilePhone().withMessage("Numéro de téléphone invalide"),
  body("permissions").optional().isArray().withMessage("Les permissions doivent être un tableau"),
  body("permissions.*").optional().isIn([
    "GERER_ACTIVITES",
    "GERER_RESSOURCES",
    "GERER_UTILISATEURS",
    "GERER_BUREAUX",
    "GERER_ACTUALITES",
    "GERER_PARTENARIATS",
    "GERER_EVENEMENTS",
    "GERER_NEWSLETTERS",
    "GERER_ESPACE_APROPOS",
  ]).withMessage("Permission invalide"),
];

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs (nécessite GERER_UTILISATEURS)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
// router.get("/", requireAuth, requirePermission("GERER_UTILISATEURS"), userController.getAllUsers);
router.get("/", requireAuth,  userController.getAllUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Statistiques des utilisateurs (nécessite GERER_UTILISATEURS)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des utilisateurs
 */
router.get("/stats", requireAuth, userController.getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 */
router.get("/:id", requireAuth, userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur (nécessite GERER_UTILISATEURS)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, GESTIONNAIRE, RESPONSABLE_ACTIVITES, RESPONSABLE_RESSOURCES, RESPONSABLE_COMMUNICATION, MEMBER]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [GERER_ACTIVITES, GERER_RESSOURCES, GERER_UTILISATEURS, GERER_BUREAUX, GERER_ACTUALITES, GERER_PARTENARIATS, GERER_EVENEMENTS, GERER_NEWSLETTERS, GERER_ESPACE_APROPOS]
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Utilisateur créé
 */
router.post(
  "/",
  requireAuth,
  // requirePermission("GERER_UTILISATEURS"),
  upload.single("profilePic"),
  createUserValidation,
  userController.createUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur (nécessite GERER_UTILISATEURS ou être l'utilisateur lui-même)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, GESTIONNAIRE, RESPONSABLE_ACTIVITES, RESPONSABLE_RESSOURCES, RESPONSABLE_COMMUNICATION, MEMBER]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [GERER_ACTIVITES, GERER_RESSOURCES, GERER_UTILISATEURS, GERER_BUREAUX, GERER_ACTUALITES, GERER_PARTENARIATS, GERER_EVENEMENTS, GERER_NEWSLETTERS, GERER_ESPACE_APROPOS]
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
router.put(
  "/:id",
  requireAuth,
  // (req, res, next) => {
  //   // Vérifie si l'utilisateur est un admin ou s'il modifie son propre profil
  //   if (req.params.id !== res.locals.user.id && !res.locals.user.permissions.some(p => p.name === "GERER_UTILISATEURS")) {
  //     return res.status(403).json({
  //       message: "Permission refusée. Vous ne pouvez modifier que votre propre profil.",
  //       code: "PERMISSION_REFUSEE",
  //     });
  //   }
  //   next();
  // },
  upload.single("profilePic"),
  updateUserValidation,
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (nécessite GERER_UTILISATEURS)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete("/:id", requireAuth, userController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe d'un utilisateur (nécessite GERER_UTILISATEURS)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 */
router.post("/:id/reset-password", requireAuth,  userController.resetUserPassword);

module.exports = router;
