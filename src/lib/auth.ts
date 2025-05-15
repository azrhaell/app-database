// lib/auth.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/app/api/database/dbclient";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.password) {
          throw new Error("CPF ou senha inválidos");
        }

        const user = await prisma.users.findUnique({
          where: { cpf: credentials.cpf },
        });

        if (!user || !user.password) {
          throw new Error("CPF ou senha inválidos");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("CPF ou senha inválidos");
        }

        return {
          id: user.idUser.toString(),  // id deve ser string
          name: user.name,
          email: user.email1,
          cpf: user.cpf,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // redireciona para sua rota de login
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.cpf = user.cpf;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.cpf = token.cpf as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};