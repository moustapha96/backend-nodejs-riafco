const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase() {
    const backupPath = path.join(__dirname, 'backups', 'backup-2025-09-23T20-13-23-134Z.json');
    console.log("🔄 Restoring database from backup...");

    if (!fs.existsSync(backupPath)) {
        console.error(`❌ Backup file not found: ${backupPath}`);
        process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    console.log(`📊 Backup file loaded: ${backupPath}`);

    try {
        // Désactiver les contraintes de clé étrangère
        await prisma.$executeRawUnsafe(`SET session_replication_role = replica;`);

        // Vider les tables existantes
        console.log("🧹 Clearing existing data...");
        for (const table of Object.keys(backupData)) {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
                console.log(`🗑️ Cleared table: ${table}`);
            } catch (err) {
                console.warn(`⚠️ Skipping table (not found): ${table}`);
            }
        }

        // Insérer les données en utilisant Prisma
        for (const [modelName, rows] of Object.entries(backupData)) {
            if (rows.length > 0) {
                console.log(`📥 Inserting ${rows.length} rows into ${modelName}...`);
                for (const row of rows) {
                    try {
                        // Utilisez la méthode create de Prisma pour chaque modèle
                        await prisma[modelName.toLowerCase()].create({
                            data: row,
                        });
                    } catch (err) {
                        console.warn(`⚠️ Failed to insert into ${modelName}:`, err.message);
                    }
                }
            }
        }

        // Réactiver les contraintes de clé étrangère
        await prisma.$executeRawUnsafe(`SET session_replication_role = DEFAULT;`);

        console.log("✅ Database restoration completed successfully!");
    } catch (err) {
        console.error("❌ Database restoration failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

restoreDatabase();