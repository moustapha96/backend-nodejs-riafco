const { body, validationResult } = require('express-validator');

// Validation pour la création d'utilisateur
const createUserValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Veuillez fournir un email valide"),
  body("firstName").trim().isLength({ min: 2, max: 50 }).withMessage("Le prénom doit contenir entre 2 et 50 caractères"),
  body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("Le nom doit contenir entre 2 et 50 caractères"),
  body("role").optional().isIn(["ADMIN", "GUEST", "MEMBER"]).withMessage("Rôle invalide"),
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

// Validation pour la mise à jour d'utilisateur
const updateUserValidation = [
  body("firstName").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Le prénom doit contenir entre 2 et 50 caractères"),
  body("lastName").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Le nom doit contenir entre 2 et 50 caractères"),
  body("role").optional().isIn(["ADMIN", "GUEST", "MEMBER"]).withMessage("Rôle invalide"),
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

// Middleware pour gérer les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { createUserValidation, updateUserValidation, validate };
