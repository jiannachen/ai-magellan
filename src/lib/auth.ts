import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, GitHub],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      try {
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
        const isAdmin = adminEmails.includes(user.email.toLowerCase())

        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        })

        if (existingUser) {
          await db
            .update(users)
            .set({
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              ...(isAdmin && existingUser.role !== 'admin' ? { role: 'admin' } : {}),
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(users.id, existingUser.id))
        } else {
          const userId = crypto.randomUUID()
          await db.insert(users).values({
            id: userId,
            email: user.email,
            name: user.name || "User",
            image: user.image || null,
            ...(isAdmin ? { role: 'admin' } : {}),
          })
        }
      } catch (error) {
        console.error("Failed to sync user to database:", error)
      }

      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
            columns: { id: true },
          })
          if (dbUser) {
            token.dbUserId = dbUser.id
          }
        } catch (error) {
          console.error("Failed to get user ID:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.dbUserId) {
        session.user.id = token.dbUserId as string
      }
      return session
    },
  },
})
