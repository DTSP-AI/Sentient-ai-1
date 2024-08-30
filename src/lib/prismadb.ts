// src/lib/prismadb.ts

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from 'dotenv';
import path from 'path';

// Load the .env.local file
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
}

declare global {
  // Extending the NodeJS global interface
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') global.prismaGlobal = prisma;

export default prisma;
