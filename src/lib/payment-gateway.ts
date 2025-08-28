import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from './db'

export interface PaymentConfig {
  apiKey: string
  secret: string
  webhookSecret: string
  mode: 'test' | 'live'
}

export interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  description: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  transactionId?: string
  error?: string
}

export abstract class PaymentGateway {
  protected config: PaymentConfig
  protected gatewayId: string

  constructor(config: PaymentConfig, gatewayId: string) {
    this.config = config
    this.gatewayId = gatewayId
  }

  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>
  abstract verifyPayment(transactionId: string): Promise<boolean>
  abstract processWebhook(payload: any, signature: string): Promise<any>
  abstract refundPayment(transactionId: string, amount: number): Promise<boolean>
}

// Razorpay Implementation
export class RazorpayGateway extends PaymentGateway {
  private razorpay: any

  constructor(config: PaymentConfig, gatewayId: string) {
    super(config, gatewayId)
    // Initialize Razorpay (install: npm install razorpay)
    // const Razorpay = require('razorpay')
    // this.razorpay = new Razorpay({
    //   key_id: config.apiKey,
    //   key_secret: config.secret,
    // })
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create Razorpay order
      const order = await this.razorpay.orders.create({
        amount: request.amount * 100, // Amount in paise
        currency: request.currency,
        receipt: request.orderId,
        notes: {
          description: request.description
        }
      })

      // Save transaction to database
      await prisma.paymentTransaction.create({
        data: {
          transactionId: order.id,
          orderId: request.orderId,
          amount: new Decimal(request.amount),
          currency: request.currency,
          status: 'PENDING',
          paymentMethod: 'CARD',
          gatewayId: this.gatewayId,
          userId: '', // Will be set from context
          description: request.description,
          metadata: JSON.stringify(order)
        }
      })

      return {
        success: true,
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/checkout/${order.id}`,
        transactionId: order.id
      }
    } catch (error) {
      console.error('Razorpay payment creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const payment = await this.razorpay.payments.fetch(transactionId)
      return payment.status === 'captured'
    } catch (error) {
      console.error('Payment verification failed:', error)
      return false
    }
  }

  async processWebhook(payload: any, signature: string): Promise<any> {
    try {
      // Verify webhook signature
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex')

      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature')
      }

      // Save webhook event
      await prisma.paymentWebhook.create({
        data: {
          gatewayId: this.gatewayId,
          event: payload.event,
          payload: JSON.stringify(payload),
          transactionId: payload.payload?.payment?.entity?.order_id
        }
      })

      // Process the webhook based on event type
      switch (payload.event) {
        case 'payment.captured':
          await this.handlePaymentSuccess(payload.payload.payment.entity)
          break
        case 'payment.failed':
          await this.handlePaymentFailed(payload.payload.payment.entity)
          break
      }

      return { processed: true }
    } catch (error) {
      console.error('Webhook processing failed:', error)
      throw error
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    try {
      const refund = await this.razorpay.payments.refund(transactionId, {
        amount: amount * 100 // Amount in paise
      })

      // Update transaction record
      await prisma.paymentTransaction.update({
        where: { transactionId },
        data: {
          refundAmount: new Decimal(amount),
          refundedAt: new Date(),
          status: amount === 0 ? 'REFUNDED' : 'PARTIAL_REFUND'
        }
      })

      return refund.status === 'processed'
    } catch (error) {
      console.error('Refund failed:', error)
      return false
    }
  }

  private async handlePaymentSuccess(payment: any) {
    await prisma.paymentTransaction.update({
      where: { transactionId: payment.order_id },
      data: {
        status: 'SUCCESS',
        gatewayResponse: JSON.stringify(payment)
      }
    })

    // Update related fee payment
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { transactionId: payment.order_id },
      include: { feePayments: true }
    })

    if (transaction?.feePayments.length) {
      await prisma.feePayment.updateMany({
        where: { transactionId: transaction.id },
        data: { status: 'COMPLETED' }
      })
    }
  }

  private async handlePaymentFailed(payment: any) {
    await prisma.paymentTransaction.update({
      where: { transactionId: payment.order_id },
      data: {
        status: 'FAILED',
        failureReason: payment.error_description,
        gatewayResponse: JSON.stringify(payment)
      }
    })
  }
}

// Stripe Implementation
export class StripeGateway extends PaymentGateway {
  private stripe: any

  constructor(config: PaymentConfig, gatewayId: string) {
    super(config, gatewayId)
    // Initialize Stripe (install: npm install stripe)
    // const Stripe = require('stripe')
    // this.stripe = new Stripe(config.secret, {
    //   apiVersion: '2023-10-16',
    // })
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: request.currency.toLowerCase(),
            product_data: {
              name: request.description,
            },
            unit_amount: request.amount * 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        customer_email: request.customerEmail,
        metadata: {
          orderId: request.orderId
        }
      })

      // Save transaction to database
      await prisma.paymentTransaction.create({
        data: {
          transactionId: session.id,
          orderId: request.orderId,
          amount: new Decimal(request.amount),
          currency: request.currency,
          status: 'PENDING',
          paymentMethod: 'CARD',
          gatewayId: this.gatewayId,
          userId: '', // Will be set from context
          description: request.description,
          metadata: JSON.stringify(session)
        }
      })

      return {
        success: true,
        paymentUrl: session.url,
        transactionId: session.id
      }
    } catch (error) {
      console.error('Stripe payment creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(transactionId)
      return session.payment_status === 'paid'
    } catch (error) {
      console.error('Payment verification failed:', error)
      return false
    }
  }

  async processWebhook(payload: any, signature: string): Promise<any> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      )

      // Save webhook event
      await prisma.paymentWebhook.create({
        data: {
          gatewayId: this.gatewayId,
          event: event.type,
          payload: JSON.stringify(event.data),
          transactionId: event.data.object.id
        }
      })

      // Process the webhook
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handlePaymentSuccess(event.data.object)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break
      }

      return { processed: true }
    } catch (error) {
      console.error('Stripe webhook processing failed:', error)
      throw error
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    try {
      // Get the payment intent from the session
      const session = await this.stripe.checkout.sessions.retrieve(transactionId)
      const refund = await this.stripe.refunds.create({
        payment_intent: session.payment_intent,
        amount: amount * 100
      })

      // Update transaction record
      await prisma.paymentTransaction.update({
        where: { transactionId },
        data: {
          refundAmount: new Decimal(amount),
          refundedAt: new Date(),
          status: refund.status === 'succeeded' ? 'REFUNDED' : 'PARTIAL_REFUND'
        }
      })

      return refund.status === 'succeeded'
    } catch (error) {
      console.error('Stripe refund failed:', error)
      return false
    }
  }

  private async handlePaymentSuccess(session: any) {
    await prisma.paymentTransaction.update({
      where: { transactionId: session.id },
      data: {
        status: 'SUCCESS',
        gatewayResponse: JSON.stringify(session)
      }
    })
  }

  private async handlePaymentFailed(paymentIntent: any) {
    // Find transaction by payment intent
    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        metadata: {
          contains: paymentIntent.id
        }
      }
    })

    if (transaction) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          failureReason: paymentIntent.last_payment_error?.message,
          gatewayResponse: JSON.stringify(paymentIntent)
        }
      })
    }
  }
}

// Gateway Factory
export class PaymentGatewayFactory {
  static async createGateway(gatewayId: string): Promise<PaymentGateway> {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id: gatewayId }
    })

    if (!gateway || !gateway.isActive) {
      throw new Error('Payment gateway not found or inactive')
    }

    const config = JSON.parse(gateway.config) as PaymentConfig

    switch (gateway.provider.toLowerCase()) {
      case 'razorpay':
        return new RazorpayGateway(config, gatewayId)
      case 'stripe':
        return new StripeGateway(config, gatewayId)
      default:
        throw new Error(`Unsupported payment provider: ${gateway.provider}`)
    }
  }

  static async getDefaultGateway(): Promise<PaymentGateway> {
    const gateway = await prisma.paymentGateway.findFirst({
      where: { isDefault: true, isActive: true }
    })

    if (!gateway) {
      throw new Error('No default payment gateway configured')
    }

    return this.createGateway(gateway.id)
  }
}
