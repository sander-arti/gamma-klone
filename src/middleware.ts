import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for protecting routes with Supabase Auth
 *
 * - Public routes: /, /login, /signup, /view, /preview, /about, /features, /pricing, /docs, /contact, /terms, /privacy
 * - API routes with custom auth: /api/v1/* (uses API key auth, not session auth)
 * - All other routes require authentication
 */

export async function middleware(request: NextRequest) {
  // Skip API routes with API key auth (custom auth, not Supabase Auth)
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    return NextResponse.next();
  }

  // Skip public routes
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/view',
    '/preview',
    '/about',
    '/features',
    '/pricing',
    '/docs',
    '/contact',
    '/terms',
    '/privacy',
  ];

  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
