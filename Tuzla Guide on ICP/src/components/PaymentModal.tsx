import React, { useState, useEffect, useMemo } from 'react';
import { X, QrCode, CreditCard, Bitcoin, DollarSign, Check, Clock } from 'lucide-react';
import { Attraction, PaymentTransaction, CryptoPaymentOption } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { icpService } from '../services/icpService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  attraction: Attraction | null;
}

const cryptoOptions: CryptoPaymentOption[] = [
  {
    id: 'polygon-usdt',
    name: 'USDT (Polygon)',
    symbol: 'USDT',
    network: 'Polygon',
    enabled: true,
  },
  {
    id: 'ethereum-usdt',
    name: 'USDT (Ethereum)',
    symbol: 'USDT',
    network: 'Ethereum',
    enabled: true,
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    enabled: true,
  },
  {
    id: 'icp',
    name: 'Internet Computer',
    symbol: 'ICP',
    network: 'ICP',
    enabled: true,
  },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  attraction,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('polygon-usdt');
  const [paymentTransaction, setPaymentTransaction] = useState<PaymentTransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(300); // 5 minutes timeout

  const selectedCrypto = useMemo(() => 
    cryptoOptions.find(opt => opt.id === selectedMethod),
    [selectedMethod]
  );

  useEffect(() => {
    if (!isOpen) {
      setPaymentTransaction(null);
      setPaymentStatus('pending');
      setIsProcessing(false);
      setCountdown(300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (paymentStatus === 'pending' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && paymentStatus === 'pending') {
      setPaymentStatus('failed');
    }
  }, [countdown, paymentStatus]);

  const handlePayment = async () => {
    if (!attraction) return;

    setIsProcessing(true);
    
    try {
      // Create payment transaction on ICP
      const transaction = await icpService.createPayment(
        attraction.id,
        attraction.price,
        'USD',
        selectedCrypto?.symbol || 'USDT'
      );
      
      setPaymentTransaction(transaction);
      
      // Simulate payment monitoring
      monitorPayment(transaction.id);
      
    } catch (error) {
      console.error('Payment creation failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const monitorPayment = async (paymentId: string) => {
    // In production, this would poll the payment API
    // For demo, we'll simulate success after 10-30 seconds
    const delay = Math.random() * 20000 + 10000; // 10-30 seconds
    
    setTimeout(async () => {
      try {
        // Simulate payment completion
        await icpService.updatePaymentStatus(paymentId, 'completed');
        setPaymentStatus('completed');
      } catch (error) {
        console.error('Payment monitoring error:', error);
        setPaymentStatus('failed');
      }
    }, delay);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !attraction) return null;

  const renderPaymentContent = () => {
    if (paymentStatus === 'completed') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your payment for {attraction.name} has been processed successfully.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-6">
            The payment has expired or failed. Please try again.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPaymentStatus('pending');
                setPaymentTransaction(null);
                setCountdown(300);
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (paymentTransaction) {
      return (
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Payment</h3>
            <p className="text-gray-600">Scan the QR code to pay with {selectedCrypto?.name}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex justify-center mb-4">
              <QRCodeCanvas
                value={paymentTransaction.qrCodeData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Amount to pay:</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(attraction.price / 100).toFixed(2)} {selectedCrypto?.symbol}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <Clock size={16} />
            <span>Payment expires in: {formatTime(countdown)}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>How to pay:</strong><br />
              1. Open your crypto wallet app<br />
              2. Scan the QR code above<br />
              3. Confirm the payment
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPaymentTransaction(null);
                setCountdown(300);
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">{attraction.name}</span>
              <span className="font-semibold">
                {attraction.price === 0 ? 'Free' : `$${(attraction.price / 100).toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg font-bold">
                {attraction.price === 0 ? 'Free' : `$${(attraction.price / 100).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Select Payment Method</h4>
          <div className="space-y-2">
            {cryptoOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.id}
                  checked={selectedMethod === option.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center flex-1">
                  {option.symbol === 'BTC' ? (
                    <Bitcoin size={20} className="mr-3 text-orange-500" />
                  ) : option.symbol === 'ICP' ? (
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-3" />
                  ) : (
                    <DollarSign size={20} className="mr-3 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.network}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || attraction.price === 0}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {renderPaymentContent()}
        </div>
      </div>
    </div>
  );
};