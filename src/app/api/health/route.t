import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSystemMetrics } from '@/lib/monitoring'

export async function GET() {
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`
    
    // Get system metrics
    const metrics = await getSystemMetrics()
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      metrics
    }
    
    return NextResponse.json(healthStatus)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        database: 'disconnected'
      },
      { status: 503 }
    )
  }
}
