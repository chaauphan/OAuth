import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        
        // Fetch user's display name from database
        try {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { displayName: true }
          });
          session.user.displayName = user?.displayName || null;
        } catch (error) {
          console.error('Error fetching display name for session:', error);
          session.user.displayName = null;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
}; 