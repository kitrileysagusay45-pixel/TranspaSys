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
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (publicRoutes.includes(pathname)) {
    if (user) {
      // Logged-in user visiting login/register → redirect to dashboard
      const { data: profile } = await supabase
        .from('users')
        .select('role, deleted_at')
        .eq('id', user.id)
        .single();

      if (profile?.deleted_at) {
        await supabase.auth.signOut();
        return supabaseResponse;
      }

      const isAdmin = profile && ['admin', 'treasurer', 'sk'].includes(profile.role);
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? '/admin/dashboard' : '/user/dashboard';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protected routes
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Role-based access
  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, deleted_at')
      .eq('id', user.id)
      .single();

    if (profile?.deleted_at) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const isAdmin = profile && ['admin', 'treasurer', 'sk'].includes(profile.role);

    if (pathname.startsWith('/admin') && !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/user/dashboard';
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
