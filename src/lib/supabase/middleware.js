import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verification-pending'];
  if (publicRoutes.includes(pathname)) {
    if (user) {
      // Logged-in user visiting public routes
      const { data: profile } = await supabase
        .from('users')
        .select('role, is_approved')
        .eq('id', user.id)
        .single();

      const isAdmin = (profile && ['admin', 'treasurer', 'sk'].includes(profile.role)) || 
                      user.email === 'admin@transpasys.com';
      const isApproved = profile?.is_approved === true || isAdmin;
      const emailVerified = !!user.email_confirmed_at;

      // Handle redirects from public pages if already logged in
      if (pathname === '/login' || pathname === '/register') {
        // 1. Email verification first (for everyone)
        if (!emailVerified) {
          const url = request.nextUrl.clone();
          url.pathname = '/verify-email';
          return NextResponse.redirect(url);
        }

        // 2. Admin verification second (ONLY for residents)
        if (!isAdmin && !isApproved) {
          const url = request.nextUrl.clone();
          url.pathname = '/verification-pending';
          return NextResponse.redirect(url);
        }

        // 3. To dashboard
        const url = request.nextUrl.clone();
        url.pathname = isAdmin ? '/admin/dashboard' : '/user/dashboard';
        return NextResponse.redirect(url);
      }

      // If at /verify-email but already verified
      if (pathname === '/verify-email' && emailVerified) {
        if (isAdmin) {
          const url = request.nextUrl.clone();
          url.pathname = '/admin/dashboard';
          return NextResponse.redirect(url);
        }
        const url = request.nextUrl.clone();
        url.pathname = isApproved ? '/user/dashboard' : '/verification-pending';
        return NextResponse.redirect(url);
      }

      // If at /verification-pending but is an admin
      if (pathname === '/verification-pending' && isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
      }
    }
    return supabaseResponse;
  }

  // Protected routes
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check Email Verification (Always required for everyone)
  if (!user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = '/verify-email';
    return NextResponse.redirect(url);
  }

  // Role-based access and Approval check
  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_approved')
      .eq('id', user.id)
      .single();

    const isAdmin = (profile && ['admin', 'treasurer', 'sk'].includes(profile.role)) || 
                    user.email === 'admin@transpasys.com';
    const isApproved = profile?.is_approved === true || isAdmin;

    // Residents MUST be approved to access /user dashboard
    // Admins are NEVER blocked by is_approved
    if (pathname.startsWith('/user') && !isAdmin && !isApproved) {
      const url = request.nextUrl.clone();
      url.pathname = '/verification-pending';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/admin') && !isAdmin) {
      // Special case: if it's the very first login and profile isn't set up yet,
      // we might want to allow access if it's a specific admin email, but
      // normally we just redirect to user dashboard or pending.
      const url = request.nextUrl.clone();
      url.pathname = isApproved ? '/user/dashboard' : '/verification-pending';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/user') && isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
