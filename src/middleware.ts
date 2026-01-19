import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard");
        const isPosRoute = req.nextUrl.pathname.startsWith("/pos");

        if (!token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Redirect "FUNCIONARIO" trying to access Dashboard -> POS
        if (isAdminRoute && token.role !== "GERENTE") {
            return NextResponse.redirect(new URL("/pos", req.url));
        }

        // Redirect "GERENTE" trying to access POS -> Allow or Redirect? 
        // Manager should be able to access POS too. But maybe default home for them is dashboard.
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/pos/:path*"]
};
