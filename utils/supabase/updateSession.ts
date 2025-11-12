import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  // Keep auth.getUser() here — removing it may cause session desyncs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Don't redirect API routes — API callers expect JSON
  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/error') &&
    !pathname.startsWith('/api')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (!user) return supabaseResponse

  try {
    const email = (user.email ?? '').toLowerCase()

    const { data: papel } = await supabase
      .from('user_permission')
      .select('role:role_id(name)')
      .ilike('email', email)
      .maybeSingle()

    const roleName = Array.isArray((papel as any)?.role)
      ? (papel as any).role[0]?.name
      : (papel as any)?.role?.name
    const role = (roleName || '').toUpperCase()

    // Try relational embed (page:page_id(id,route))
    try {
      const { data: rel } = await supabase
        .from('user_page_permission')
        .select('page:page_id(id,route)')
        .ilike('email', email)

      if (Array.isArray(rel) && rel.length > 0 && rel[0]?.page) {
        const allowedRoutes = rel.map((r: any) => r.page?.route).filter(Boolean).map((s: string) => s.replace(/\/$/, ''))
        if (!pathname.startsWith('/api')) {
          const allowed = allowedRoutes.some((r: string) => pathname.startsWith(r))
          if (!allowed && role !== 'ADMIN') {
            const url = request.nextUrl.clone()
            url.pathname = '/private/agenda'
            return NextResponse.redirect(url)
          }
        }
        return supabaseResponse
      }
    } catch (e) {
      // fallthrough
    }

    // Fallback: raw page_id values (uuid or json/jsonb)
    try {
      const { data: raws } = await supabase
        .from('user_page_permission')
        .select('page_id')
        .ilike('email', email)

      const ids = new Set<string>()
      if (Array.isArray(raws)) {
        for (const r of raws) {
          const pid = r?.page_id
          if (!pid) continue
          if (Array.isArray(pid)) pid.forEach((v: any) => typeof v === 'string' && ids.add(v))
          else if (typeof pid === 'string') ids.add(pid)
          else if (pid && typeof pid === 'object') {
            const rawVal = (pid as any).value ?? pid
            try {
              const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal
              if (Array.isArray(parsed)) parsed.forEach((v: any) => typeof v === 'string' && ids.add(v))
              else if (typeof parsed === 'string') ids.add(parsed)
            } catch {}
          }
        }
      }

      const idsArr = Array.from(ids)
      if (idsArr.length > 0) {
        const { data: pages } = await supabase.from('page').select('id,route').in('id', idsArr)
        const allowedRoutes = (pages || []).map((p: any) => p?.route).filter(Boolean).map((s: string) => s.replace(/\/$/, ''))
        if (!pathname.startsWith('/api')) {
          const allowed = allowedRoutes.some((r: string) => pathname.startsWith(r))
          if (!allowed && role !== 'ADMIN') {
            const url = request.nextUrl.clone()
            url.pathname = '/private/agenda'
            return NextResponse.redirect(url)
          }
        }
        return supabaseResponse
      }
    } catch (e) {
      // fallthrough
    }

    // Role-based fallback
    const allowedPrefixes = ['/private/profile', '/private/agenda', '/private/estoque', '/private/malas']
    if (!pathname.startsWith('/api') && role !== 'ADMIN') {
      const allowed = allowedPrefixes.some((p) => pathname.startsWith(p))
      if (!allowed && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
        const url = request.nextUrl.clone()
        url.pathname = '/private/agenda'
        return NextResponse.redirect(url)
      }
    }
  } catch (e) {
    console.warn('[middleware] RBAC enforcement failed, continuing', e)
  }

  return supabaseResponse
}
