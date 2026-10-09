import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "ptc_furnitures_nextauth_local_secret_key_12345",
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

