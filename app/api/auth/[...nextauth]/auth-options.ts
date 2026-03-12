import { UserRole } from "@/types";
import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareHash } from "@/lib/bcrypt";
import prisma from "@/lib/prisma";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(
            JSON.stringify({
              code: 400,
              message: "Silahkan masukkan email dan password.",
            })
          );
        }
        console.log(credentials);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log(user);

        if (!user) {
          throw new Error(
            JSON.stringify({
              code: 404,
              message: "Pengguna tidak ditemukan.",
            })
          );
        }

        const isPasswordValid = await compareHash(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error(
            JSON.stringify({
              code: 401,
              message: "Kredensial tidak valid.",
            })
          );
        }

        if (!user.isActive) {
          throw new Error(
            JSON.stringify({
              code: 403,
              message: "Akun tidak aktif. Silahkan hubungi administrator.",
            })
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "Anonymous",
          role: user.role as UserRole,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 * 120,
  },
  callbacks: {
    async jwt({
      token,
      user,
      session,
      trigger,
    }: {
      token: JWT;
      user: User;
      session?: Session;
      trigger?: "signIn" | "signUp" | "update";
    }) {
      if (trigger === "update" && session?.user) {
        token = { ...token, ...session.user };
      } else if (user) {
        token.id = user.id ?? (token.sub as string);
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
