import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { type SubscriptionStatus, type UserRole } from "@prisma/client"
import bcryptjs from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  debug: true, // ✅ ADDED (DO NOT REMOVE)

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

        const isValid = await bcryptjs.compare(password, user.password)

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
          subscriptionPlan: string | null
        }

        const u = user as unknown as TokenUser
        token.id = u.id
        token.role = u.role
        token.subscriptionStatus = u.subscriptionStatus
        token.subscriptionPlan = u.subscriptionPlan
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        type TokenData = {
          id?: string
          role?: UserRole
          subscriptionStatus?: SubscriptionStatus
          subscriptionPlan?: string | null
        }

        const t = token as unknown as TokenData
        session.user.id = t.id as string
        session.user.role = t.role as UserRole
        session.user.subscriptionStatus = t.subscriptionStatus as SubscriptionStatus
        session.user.subscriptionPlan = t.subscriptionPlan as string | null
      }
      return session
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async signIn(message) {
      console.log("SIGN IN EVENT:", message)
      // Record every login event for analytics
      try {
        if (message.user?.id) {
          await (prisma as any).loginEvent.create({
            data: {
              userId: message.user.id,
              provider: message.account?.provider ?? "credentials",
            },
          })
        }
      } catch (e) {
        console.error("Failed to record login event:", e)
      }
    },
  },
})