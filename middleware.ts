export { auth as middleware } from '@/lib/auth';

// Don't invoke Middleware on some paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     * - verify-email (verify email page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|verify-email).*)',
  ],
};
