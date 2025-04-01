import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks/clerk(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (isPublicRoute(request)) {
    return; // Don't protect public routes
  }

  // For protected routes, Clerk will handle authentication automatically
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)', // Exclude Next.js internals and static files
    '/',                      // Include root route
    '/(api|trpc)(.*)',        // Include all API routes
  ],
};