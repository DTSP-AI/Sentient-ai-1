//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\scripts\seed.ts

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from "dotenv";
import path from 'path';

// Load environment variables from .env in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("DIRECT_DATABASE_URL:", process.env.DIRECT_DATABASE_URL);

const prisma = new PrismaClient().$extends(withAccelerate());

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