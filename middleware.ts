import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const protectedRoutes = ["/dashboard", "/projects"]
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*"],
}
