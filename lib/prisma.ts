import { PrismaClient } from '@prisma/client'

// Evitar múltiples instancias de Prisma en desarrollo (Hot Reload de Next.js)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
