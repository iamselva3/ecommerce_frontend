import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, CreditCard, Smartphone, Lock, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const { orderData } = location.state || {};
  const [loading, setLoading] = useState(false);
  
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  
  // Razorpay will handle UPI inputs and apps.
  if (!orderData) {
    navigate("/checkout");
    return null;
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    } 
    // Format CVV (max 4 digits)
    else if (name === "cvv") {
      const formattedValue = value.replace(/\D/g, "").slice(0, 4);
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    }
    // Format expiry month/year
    else if (name === "expiryMonth") {
      const formattedValue = value.replace(/\D/g, "").slice(0, 2);
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === "expiryYear") {
      const formattedValue = value.replace(/\D/g, "").slice(0, 4);
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateCardDetails = () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return false;
    }
    if (!cardDetails.cardHolder) {
      toast.error("Please enter card holder name");
      return false;
    }
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      toast.error("Please enter card expiry date");
      return false;
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return false;
    }
    
    // Check if card is expired
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (parseInt(cardDetails.expiryYear) < currentYear || 
        (parseInt(cardDetails.expiryYear) === currentYear && parseInt(cardDetails.expiryMonth) < currentMonth)) {
      toast.error("Card has expired");
      return false;
    }
    
    return true;
  };

  // No frontend validation needed for UPI anymore, Razorpay handles it.

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (method) => {
    setLoading(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Payment SDK failed to load.");
        setLoading(false);
        return;
      }
      
      const keyRes = await fetch(`${API_URL}/api/payment/get-razorpay-key`, {credentials: "include"});
      const { key } = await keyRes.json();
      
      const orderRes = await fetch(`${API_URL}/api/payment/razorpay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: orderData.total }),
      });
      const order = await orderRes.json();
      
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "E-commerce",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response) {
          await processOrder(method, "completed", response);
        },
        prefill: {
          name: orderData.address?.fullName || user?.name || "",
          email: user?.email || "",
          contact: orderData.address?.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };
      
      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
          // You receive an error object in response.error
          processOrder(method, "failed", response);
      });
      
      paymentObject.open();
    } catch (error) {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processCardPayment = async () => {
    handleRazorpayPayment("card");
  };

  const processUpiPayment = async () => {
    handleRazorpayPayment("upi");
  };

  const processOrder = async (paymentMethod, paymentStatus = "completed", razorpayResponse = null) => {
    try {
      let transactionId = null;
      if (razorpayResponse) {
        if (paymentStatus === "completed") {
           transactionId = razorpayResponse.razorpay_payment_id;
        } else if (paymentStatus === "failed" && razorpayResponse.error) {
           transactionId = razorpayResponse.error.metadata?.payment_id;
        }
      }

      const orderDataToSend = {
        items: orderData.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          size: orderData.selectedSizes[item.productId] || null,
          color: null,
          image: item.image,
        })),
         deliveryInfo: {
        estimatedDays: orderData?.deliveryInfo?.estimatedDays,
        estimatedDate: orderData?.deliveryInfo?.estimatedDate,
        codAvailable: orderData?.deliveryInfo?.codAvailable,
      },
        
        shippingAddress: orderData.address,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        transactionId: transactionId,
        paidAmount: paymentStatus === "completed" ? orderData.total : 0,
        isDirectBuy: orderData.isDirectBuy || false,
        notes: '',
        discount: 0,
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderDataToSend),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to place order");
      }

      // Clear cart if not direct buy
      if (!orderData.isDirectBuy) {
        await fetch(`${API_URL}/api/cart/clear`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      if (paymentStatus === "failed") {
        toast.error("Payment failed. Order saved with failed status.");
      } else {
        toast.success("🎉 Payment successful! Order placed.");
      }
      
      navigate("/order-confirmation", {
        state: {
          orderId: responseData.data?.orderId || responseData.orderId,
          total: responseData.data?.totalAmount || orderData.total,
          paymentMethod: paymentMethod,
        },
      });
    } catch (error) {
      console.error("Payment order error:", error);
      toast.error("Payment successful but order creation failed. Contact support.");
    }
  };

  const renderCardPaymentForm = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Card Details</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleCardInputChange}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength="19"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Holder Name
          </label>
          <input
            type="text"
            name="cardHolder"
            value={cardDetails.cardHolder}
            onChange={handleCardInputChange}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="expiryMonth"
                value={cardDetails.expiryMonth}
                onChange={handleCardInputChange}
                placeholder="MM"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="2"
              />
              <span className="self-center">/</span>
              <input
                type="text"
                name="expiryYear"
                value={cardDetails.expiryYear}
                onChange={handleCardInputChange}
                placeholder="YYYY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="4"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="password"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleCardInputChange}
              placeholder="123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="4"
            />
          </div>
        </div>
        
        <button
          onClick={processCardPayment}
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all mt-4
            ${loading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay ₹${orderData.total.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );

  const renderUpiPaymentForm = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Smartphone className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Pay using UPI / QR</h2>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Razorpay Secure Checkout</p>
            <p className="text-sm text-green-700 mt-1">
              You will be securely redirected to Razorpay Checkout. You can enter your UPI ID, scan a QR code, or log into your favorite UPI app directly there.
            </p>
          </div>
        </div>
        
        <button
          onClick={processUpiPayment}
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all
            ${loading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700 active:scale-[0.98]"
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Proceed to Pay ₹${orderData.total.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/checkout")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Checkout
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Payment
          </h1>
          <p className="text-gray-600 mt-2">
            Secure payment via {orderData.paymentMethod === "card" ? "Credit/Debit Card" : "UPI"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            {orderData.paymentMethod === "card" 
              ? renderCardPaymentForm() 
              : renderUpiPaymentForm()
            }
            
            {/* Security Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Secure Payment</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{orderData.subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹{orderData.gst.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">
                    {orderData.delivery === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${orderData.delivery}`
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>₹{orderData.total.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Items List */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Items ({orderData.items.length})</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {orderData.items.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {orderData.selectedSizes[item.productId] || "M"} • Qty: {item.qty}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
