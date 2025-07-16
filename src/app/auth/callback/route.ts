import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../../../lib/supabase/types';
import { type CookieOptions } from '@supabase/ssr';

/**
 * Auth callback route for handling Supabase authentication redirects
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('next') || '/dashboard';
  
  if (code) {
    // Create a response object to store cookies
    const response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    
    // Create a Supabase client using the cookies API
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Parse cookies from the request headers
            const cookieHeader = request.headers.get('cookie') || '';
            const cookie = cookieHeader
              .split('; ')
              .find(c => c.startsWith(`${name}=`));
            if (cookie) {
              return cookie.split('=')[1];
            }
            return undefined;
          },
          set(name: string, value: string, options: CookieOptions) {
            // In Next.js App Router, we need to use the response for setting cookies
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            // In Next.js App Router, we need to use the response for removing cookies
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );
    
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      return response;
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Redirect to login with error parameter
      return NextResponse.redirect(
        new URL(`/login?error=auth_exchange_error&message=${encodeURIComponent('Failed to complete authentication')}&code=${code}`, requestUrl.origin)
      );
    }
  }

  // If no code is provided, redirect to login page
  console.error('No code provided in auth callback');
  return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin));
}
