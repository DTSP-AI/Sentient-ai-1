// src/lib/prismadb.ts
import { PrismaClient } from '@prisma/client';
import { withPulse } from '@prisma/extension-pulse';
import dotenv from 'dotenv';
import path from 'path';

// Load the .env.local file
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withPulse());
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export default prisma;
