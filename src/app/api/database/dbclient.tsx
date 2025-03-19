//CONEXÃO AO BANCO DE DADOS (FORMA DE CONEXÃO RECOMENDADA PELA PRÓRIA DOCUMENTAÇÃO DO PRISMA)
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Exibe logs detalhados
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
