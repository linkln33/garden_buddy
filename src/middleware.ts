import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define protected routes that require authentication
const protectedRoutes = [
  '/diagnose',
  '/logbook',
  '/profile',
  '/community',
  '/weather',
  '/profile/change-password',
];

// Define auth routes (redirect to dashboard if already logged in)
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * Middleware to handle authentication and session management
 * This runs on every request to refresh auth tokens and pass them to components
 * Also handles route protection for authenticated pages
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !user) {
    // Redirect to login page with return URL
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check if the route is an auth route and user is already authenticated
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && user) {
    // Redirect to dashboard or home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Specify which paths should be processed by the middleware
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (images, assets, etc)
    // - Favicon
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
