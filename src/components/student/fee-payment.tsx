'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Download, CheckCircle, Clock, XCircle } from 'lucide-react'

interface FeePaymentProps {
  userId: string
}

interface FeePayment {
  id: string
  amount: number
  paymentMethod: string
  status: string
  semester: number
  year: number
  createdAt: string
  transactionId?: string
}

export function FeePayment({ userId }: FeePaymentProps) {
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/fees/payments')
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (amount: number, semester: number, year: number) => {
    try {
      // In a real implementation, integrate with Stripe/Razorpay here
      const response = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethod: 'CARD',
          semester,
          year
        })
      })

      if (response.ok) {
        fetchPayments()
        alert('Payment successful!')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Payment failed!')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'FAILED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return <div>Loading fee information...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Fee Payments
          </CardTitle>
          <CardDescription>
            Manage your semester fee payments and download receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <Alert>
              <AlertDescription>
                No payment records found. Contact the accounts department for assistance.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(payment.status)}
                    <div>
                      <div className="font-medium">
                        Semester {payment.semester}, {payment.year}
                      </div>
                      <div className="text-sm text-gray-600">
                        ₹{payment.amount.toLocaleString()} • {payment.paymentMethod}
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs text-gray-500">
                          Transaction ID: {payment.transactionId}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(payment.status) as any}>
                      {payment.status}
                    </Badge>
                    {payment.status === 'COMPLETED' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
