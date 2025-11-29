"use client";

import { useState, useEffect } from 'react';
import { Coins, CreditCard, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

interface BuyCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const BuyCoinsDialog = ({ open, onOpenChange, onSuccess }: BuyCoinsDialogProps) => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'payment' | 'processing' | 'success' | 'error'>('select');

  useEffect(() => {
    if (open) {
      fetchPackages();
      setStep('select');
      setSelectedPackage(null);
      setSelectedMethod(null);
    }
  }, [open]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/create-order');
      if (!res.ok) throw new Error('Failed to load packages');
      const data = await res.json();
      setPackages(data.packages || []);
      setPaymentMethods(data.paymentMethods || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedMethod) {
      toast.error('Please select a package and payment method');
      return;
    }

    try {
      setProcessing(true);
      setStep('processing');

      const token = localStorage.getItem('bearer_token');
      
      // Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          paymentMethod: selectedMethod,
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = await orderRes.json();

      // Simulate payment processing (in production, redirect to payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Process payment
      const pkg = packages.find(p => p.id === selectedPackage);
      const processRes = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          orderId: orderData.order.orderId,
          coins: pkg?.coins,
          amount: pkg?.price,
          paymentMethod: selectedMethod,
        }),
      });

      if (!processRes.ok) throw new Error('Payment processing failed');
      const processData = await processRes.json();

      setStep('success');
      toast.success(`Successfully purchased ${pkg?.coins} coins!`);
      
      // Delay before closing and calling success callback
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      setStep('error');
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="text-primary" size={24} />
            Buy Coins
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : step === 'select' || step === 'payment' ? (
          <div className="space-y-6 py-4">
            {/* Package Selection */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Select Package</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-center">
                      <Coins className={selectedPackage === pkg.id ? 'text-primary' : 'text-muted-foreground'} size={24} />
                    </div>
                    <div className="text-lg font-bold">{pkg.coins.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{pkg.name}</div>
                    <div className="mt-2 text-sm font-semibold text-primary">${pkg.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            {selectedPackage && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Payment Method</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => method.enabled && setSelectedMethod(method.id)}
                      disabled={!method.enabled}
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      } ${!method.enabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {method.id === 'stripe' ? (
                        <CreditCard size={20} className={selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'} />
                      ) : (
                        <Smartphone size={20} className={selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'} />
                      )}
                      <div className="text-left">
                        <div className="text-sm font-semibold">{method.name}</div>
                        {!method.enabled && <div className="text-xs text-muted-foreground">Coming Soon</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary and Action */}
            {selectedPackage && selectedMethod && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <h3 className="mb-3 text-sm font-semibold">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Package:</span>
                    <span className="font-semibold">{selectedPkg?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coins:</span>
                    <span className="font-semibold">{selectedPkg?.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-semibold">{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-primary">${selectedPkg?.price}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={processing}
                  className="mt-4 w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Complete Purchase'}
                </button>
              </div>
            )}
          </div>
        ) : step === 'processing' ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 animate-spin text-primary" size={48} />
            <h3 className="text-lg font-semibold">Processing Payment...</h3>
            <p className="mt-2 text-sm text-muted-foreground">Please wait while we process your transaction</p>
          </div>
        ) : step === 'success' ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="mb-4 text-emerald-400" size={64} />
            <h3 className="text-lg font-semibold">Payment Successful!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedPkg?.coins.toLocaleString()} coins have been added to your account
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="mb-4 text-red-400" size={64} />
            <h3 className="text-lg font-semibold">Payment Failed</h3>
            <p className="mt-2 text-sm text-muted-foreground">Please try again or contact support</p>
            <button
              onClick={() => setStep('select')}
              className="mt-4 rounded-md border border-border px-4 py-2 text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};