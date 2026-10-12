import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

// Ensure that whenever Prisma schema changes or hot-reloading happens, we always have a fresh valid PrismaClient
let prismaInstance = globalThis.prismaGlobal;

if (
  prismaInstance &&
  (!(prismaInstance as any)?.event?.fields?.thankYouFrameImageUrl ||
   !(prismaInstance as any)?.event?.fields?.apologyFrameImageUrl)
) {
  prismaInstance = prismaClientSingleton();
}

const prisma = prismaInstance ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
