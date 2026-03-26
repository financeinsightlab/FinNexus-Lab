import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient, type SubscriptionStatus, type UserRole } from "@prisma/client"
import bcryptjs from "bcryptjs"

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const isValid = await bcryptjs.compare(
          password,
          user.password
        )

        if (!isValid) return null

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        type TokenUser = {
          id: string
          role: UserRole
          subscriptionStatus: SubscriptionStatus
        }

        const u = user as unknown as TokenUser
        token.id = u.id
        token.role = u.role
        token.subscriptionStatus = u.subscriptionStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        type TokenData = {
          id?: string
          role?: UserRole
          subscriptionStatus?: SubscriptionStatus
        }

        const t = token as unknown as TokenData
        session.user.id = t.id as string
        session.user.role = t.role as UserRole
        session.user.subscriptionStatus = t.subscriptionStatus as SubscriptionStatus
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})