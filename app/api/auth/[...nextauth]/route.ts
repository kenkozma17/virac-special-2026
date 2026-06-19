import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, validatePassword } from "@/lib/auth/users";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email);
        if (!user) return null;

        const isValid = await validatePassword(user, credentials.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-up",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token.sub && session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
          },
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
