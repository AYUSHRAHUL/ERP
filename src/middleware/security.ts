import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import rateLimit from '@/lib/rate-limit'

// Rate limiting store
const limiters = new Map()

export async function securityMiddleware(request: NextRequest) {
  // Apply security headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  )

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1'
    const key = `${ip}:${request.nextUrl.pathname}`
    
    if (!limiters.has(key)) {
      limiters.set(key, rateLimit({
        interval: 60 * 1000, // 1 minute
        uniqueTokenPerInterval: 500,
      }))
    }

    try {
      await limiters.get(key).check(10, ip) // 10 requests per minute
    } catch {
      return new NextResponse('Rate limit exceeded', { status: 429 })
    }
  }

  return response
}
