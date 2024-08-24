import { PrismaClient } from "@prisma/client";
import { withPulse } from '@prisma/extension-pulse';
import dotenv from "dotenv";
import path from 'path';

// Load environment variables from .env.local in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("DIRECT_DATABASE_URL:", process.env.DIRECT_DATABASE_URL);

const prisma = new PrismaClient().$extends(withPulse());

async function main() {
    try {
        console.log("Starting to seed categories...");
        const result = await prisma.category.createMany({
            data: [
                { name: "Famous People" },
                { name: "Movies & TV" },
                { name: "Musicians" },
                { name: "Games" },
                { name: "Animals" },
                { name: "Philosophy" },
                { name: "Scientists" },
            ],
            skipDuplicates: true // Skip duplicates to prevent unique constraint errors
        });
        console.log("Categories seeded successfully", result);
    } catch (error) {
        console.error("Error seeding default categories", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
