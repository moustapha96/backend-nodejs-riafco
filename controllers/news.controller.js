const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { createAuditLog } = require("../utils/audit")
const emailService = require("../services/email.service")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

module.exports.getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, author, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const skip = (page - 1) * limit
    const take = Number.parseInt(limit)

    const where = {}
    if (status) where.status = status
    if (author) where.authorId = author
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.news.count({ where }),
    ])

    res.status(200).json({
      news,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    })
  } catch (error) {
    console.error("Get all news error:", error)
    res.status(500).json({
      message: "Failed to retrieve news",
      code: "GET_NEWS_ERROR",
    })
  }
}

module.exports.getNewsItem = async (req, res) => {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    })

    if (!newsItem) {
      return res.status(404).json({
        message: "News item not found",
        code: "NEWS_NOT_FOUND",
      })
    }

    res.status(200).json({ news: newsItem })
  } catch (error) {
    console.error("Get news item error:", error)
    res.status(500).json({
      message: "Failed to retrieve news item",
      code: "GET_NEWS_ITEM_ERROR",
    })
  }
}

module.exports.createNews = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { title, content, status = "DRAFT", publishedAt, scheduleNewsletter = false } = req.body
    const authorId = res.locals.user.id

    // Ensure upload directory exists
    const uploadDir = "uploads/news"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    let imagePath = null
    if (req.file) {
      imagePath = `/uploads/news/${Date.now()}-${req.file.originalname}`
      fs.renameSync(req.file.path, path.join(uploadDir, path.basename(imagePath)))
    }

    const newsData = {
      title: title.trim(),
      content: content.trim(),
      image: imagePath,
      status,
      authorId,
    }

    if (publishedAt) {
      newsData.publishedAt = new Date(publishedAt)
    } else if (status === "PUBLISHED") {
      newsData.publishedAt = new Date()
    }

    const news = await prisma.news.create({
      data: newsData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    })

    // Schedule newsletter if requested
    if (scheduleNewsletter && status === "PUBLISHED") {
      try {
        await this.sendNewsletterForNews(news.id)
      } catch (newsletterError) {
        console.error("Failed to send newsletter:", newsletterError)
        // Don't fail news creation if newsletter fails
      }
    }

    await createAuditLog({
      userId: authorId,
      action: "NEWS_CREATED",
      resource: "news",
      resourceId: news.id,
      details: { title: news.title, status, scheduleNewsletter },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      message: "News created successfully",
      news,
    })
  } catch (error) {
    console.error("Create news error:", error)
    res.status(500).json({
      message: "Failed to create news",
      code: "CREATE_NEWS_ERROR",
    })
  }
}

module.exports.updateNews = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { title, content, status, publishedAt } = req.body

    const existingNews = await prisma.news.findUnique({
      where: { id },
    })

    if (!existingNews) {
      return res.status(404).json({
        message: "News item not found",
        code: "NEWS_NOT_FOUND",
      })
    }

    const updateData = {
      title: title?.trim(),
      content: content?.trim(),
      status,
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    if (publishedAt) {
      updateData.publishedAt = new Date(publishedAt)
    } else if (status === "PUBLISHED" && existingNews.status !== "PUBLISHED") {
      updateData.publishedAt = new Date()
    }

    if (req.file) {
      const uploadDir = "uploads/news"
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      updateData.image = `/uploads/news/${Date.now()}-${req.file.originalname}`
      fs.renameSync(req.file.path, path.join(uploadDir, path.basename(updateData.image)))
    }

    const updatedNews = await prisma.news.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "NEWS_UPDATED",
      resource: "news",
      resourceId: id,
      details: { changes: updateData },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "News updated successfully",
      news: updatedNews,
    })
  } catch (error) {
    console.error("Update news error:", error)
    res.status(500).json({
      message: "Failed to update news",
      code: "UPDATE_NEWS_ERROR",
    })
  }
}

module.exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params

    const existingNews = await prisma.news.findUnique({
      where: { id },
    })

    if (!existingNews) {
      return res.status(404).json({
        message: "News item not found",
        code: "NEWS_NOT_FOUND",
      })
    }

    await prisma.news.delete({
      where: { id },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "NEWS_DELETED",
      resource: "news",
      resourceId: id,
      details: { title: existingNews.title },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "News deleted successfully",
    })
  } catch (error) {
    console.error("Delete news error:", error)
    res.status(500).json({
      message: "Failed to delete news",
      code: "DELETE_NEWS_ERROR",
    })
  }
}

// Newsletter management
module.exports.getNewsletterSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query

    const skip = (page - 1) * limit
    const take = Number.parseInt(limit)

    const where = {}
    if (status) where.status = status
    if (search) {
      where.email = { contains: search, mode: "insensitive" }
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.newsletterSubscriber.count({ where }),
    ])

    res.status(200).json({
      subscribers,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    })
  } catch (error) {
    console.error("Get newsletter subscribers error:", error)
    res.status(500).json({
      message: "Failed to retrieve subscribers",
      code: "GET_SUBSCRIBERS_ERROR",
    })
  }
}

module.exports.subscribeToNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { email } = req.body

    // Check if already subscribed
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingSubscriber) {
      if (existingSubscriber.status === "ACTIVE") {
        return res.status(400).json({
          message: "Email already subscribed",
          code: "ALREADY_SUBSCRIBED",
        })
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: { status: "ACTIVE" },
        })
        return res.status(200).json({
          message: "Subscription reactivated successfully",
        })
      }
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        status: "ACTIVE",
      },
    })

    await createAuditLog({
      action: "NEWSLETTER_SUBSCRIPTION",
      resource: "newsletter_subscribers",
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      message: "Subscribed to newsletter successfully",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    res.status(500).json({
      message: "Failed to subscribe to newsletter",
      code: "SUBSCRIPTION_ERROR",
    })
  }
}

module.exports.unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!subscriber) {
      return res.status(404).json({
        message: "Email not found in subscribers",
        code: "SUBSCRIBER_NOT_FOUND",
      })
    }

    await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase() },
      data: { status: "UNSUBSCRIBED" },
    })

    await createAuditLog({
      action: "NEWSLETTER_UNSUBSCRIPTION",
      resource: "newsletter_subscribers",
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "Unsubscribed from newsletter successfully",
    })
  } catch (error) {
    console.error("Newsletter unsubscription error:", error)
    res.status(500).json({
      message: "Failed to unsubscribe from newsletter",
      code: "UNSUBSCRIPTION_ERROR",
    })
  }
}

module.exports.sendNewsletterForNews = async (newsId) => {
  try {
    const news = await prisma.news.findUnique({
      where: { id: newsId },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!news) {
      throw new Error("News item not found")
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "ACTIVE" },
    })

    if (subscribers.length === 0) {
      console.log("No active subscribers found")
      return
    }

    const newsletter = {
      subject: `RIAFCO News: ${news.title}`,
      content: news.content,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>${news.title}</h1>
          ${news.image ? `<img src="${process.env.FRONTEND_URL}${news.image}" alt="${news.title}" style="max-width: 100%; height: auto;">` : ""}
          <div>${news.content}</div>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Published by ${news.author.firstName} ${news.author.lastName}<br>
            RIAFCO Newsletter
          </p>
        </div>
      `,
    }

    await emailService.sendNewsletterEmail(subscribers, newsletter)

    // Create newsletter campaign record
    await prisma.newsletterCampaign.create({
      data: {
        subject: newsletter.subject,
        content: newsletter.content,
        htmlContent: newsletter.htmlContent,
        status: "SENT",
        sentAt: new Date(),
        recipientCount: subscribers.length,
      },
    })

    console.log(`Newsletter sent to ${subscribers.length} subscribers`)
  } catch (error) {
    console.error("Send newsletter error:", error)
    throw error
  }
}
