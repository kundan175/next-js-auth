import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protect all routes that start with /protected
export const config = {
  matcher: ["/protected/:path*"],
};
