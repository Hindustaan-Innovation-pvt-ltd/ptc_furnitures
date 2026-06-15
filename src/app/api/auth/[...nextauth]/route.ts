import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USER || "admin";
        const adminPass = process.env.ADMIN_PASSWORD || "admin123";

        if (
          credentials?.username === adminUser &&
          credentials?.password === adminPass
        ) {
          return {
            id: "admin-id",
            name: "Administrator",
            email: "admin@ptcfurnitures.com",
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const { headers } = await import("next/headers");
        const headersList = await headers();
        const host =
          headersList.get("x-forwarded-host") || headersList.get("host");
        const proto = headersList.get("x-forwarded-proto") || "https";

        if (host) {
          const detectedBaseUrl = `${proto}://${host}`;
          if (url.startsWith("/")) {
            return `${detectedBaseUrl}${url}`;
          }
          const urlObj = new URL(url);
          if (
            urlObj.host === host ||
            urlObj.hostname.endsWith("ptcfurnitures.com") ||
            urlObj.hostname === "localhost"
          ) {
            return url;
          }
        }
      } catch (error) {
        console.error("Error detecting host in redirect callback:", error);
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          return url;
        }
      } catch (_) {}
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
