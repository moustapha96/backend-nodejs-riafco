const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
  errorFormat: "pretty",
})

// Enhanced logging
prisma.$on("error", (e) => {
  console.error("❌ Prisma Error:", e)
})

prisma.$on("warn", (e) => {
  console.warn("⚠️ Prisma Warning:", e)
})

prisma.$on("info", (e) => {
  console.info("ℹ️ Prisma Info:", e)
})

if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    console.log("🔍 Query:", e.query)
    console.log("📊 Params:", e.params)
    console.log("⏱️ Duration:", e.duration + "ms")
  })
}

// Test database connection with retry logic
async function connectDB() {
  const maxRetries = 5
  let retries = 0

  while (retries < maxRetries) {
    try {
      await prisma.$connect()
      console.log("✅ Database connected successfully")

      // Test with a simple query
      await prisma.$queryRaw`SELECT 1`
      console.log("✅ Database query test successful")
      return
    } catch (error) {
      retries++
      console.error(`❌ Database connection attempt ${retries}/${maxRetries} failed:`, error.message)
      if (retries === maxRetries) {
        console.error("❌ Max database connection retries reached. Exiting...")
        process.exit(1)
      }
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retries) * 1000
      console.log(`⏳ Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}. Gracefully shutting down...`)
  try {
    await prisma.$disconnect()
    console.log("✅ Database disconnected successfully")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error during database disconnection:", error)
    process.exit(1)
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})

// Initialize connection
connectDB()

module.exports = prisma
