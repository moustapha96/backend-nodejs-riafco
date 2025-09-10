const path = require("path")
const fs = require("fs")
const sharp = require("sharp")

module.exports.uploadProfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" })
    }

    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur requis" })
    }

    const fileName = `${userId}.jpg`
    const uploadDir = "/uploads/profils/"
    const filePath = path.join(uploadDir, fileName)

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Process and save image using Sharp
    await sharp(req.file.buffer).resize(300, 300).jpeg({ quality: 80 }).toFile(filePath)

    // Clean up temporary file if it exists
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(200).json({
      message: "Photo de profil uploadée avec succès",
      fileName,
      path: `/profils/${fileName}`,
    })
  } catch (error) {
    console.error("Upload profile error:", error)
    res.status(500).json({ message: "Erreur lors de l'upload de la photo de profil" })
  }
}

module.exports.uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" })
    }

    const { title, description, category, tags } = req.body
    const fileName = `${Date.now()}-${req.file.originalname}`
    const uploadDir = "/uploads/resources/"
    const filePath = path.join(uploadDir, fileName)

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Move file to destination
    fs.renameSync(req.file.path, filePath)

    res.status(200).json({
      message: "Ressource uploadée avec succès",
      fileName,
      path: `/resources/${fileName}`,
      fileType: req.file.mimetype,
      size: req.file.size,
    })
  } catch (error) {
    console.error("Upload resource error:", error)
    res.status(500).json({ message: "Erreur lors de l'upload de la ressource" })
  }
}
