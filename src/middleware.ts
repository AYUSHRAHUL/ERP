import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes
        if (pathname.startsWith('/login') || pathname === '/') {
          return true
        }
        
        // Protected routes - require authentication
        if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
          return false
        }
        
        if (pathname.startsWith('/faculty') && token?.role !== 'FACULTY') {
          return false
        }
        
        if (pathname.startsWith('/student') && token?.role !== 'STUDENT') {
          return false
        }
        
        if (pathname.startsWith('/staff') && token?.role !== 'STAFF') {
          return false
        }
        
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/faculty/:path*', 
    '/student/:path*',
    '/staff/:path*'
  ]
}
