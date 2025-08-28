import { NextResponse } from 'next/server'
import { PaymentGatewayFactory } from '@/lib/payment-gateway'

export async function POST(
  request: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || 
                     request.headers.get('stripe-signature') || ''

    // Find gateway by provider
    const gateway = await PaymentGatewayFactory.createGateway(
      params.provider === 'razorpay' ? 'razorpay_gateway_id' : 'stripe_gateway_id'
    )

    // Process webhook
    const payload = JSON.parse(body)
    await gateway.processWebhook(payload, signature)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 400 }
    )
  }
}
