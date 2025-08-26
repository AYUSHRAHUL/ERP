export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'STAFF'
  name: string
}

declare module 'next-auth' {
  interface Session {
    user: User
  }
  
  interface User {
    role: string
  }
}
