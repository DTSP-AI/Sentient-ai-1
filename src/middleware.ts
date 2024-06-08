import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhook', // Stripe webhook, should not be protected
  '/api/stripe',
  '/', // Root route
  '/chat/:path*', // Allow public access to chat routes
  '/api/:path*' // Allow public access to all API routes
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)', '/'],
};
