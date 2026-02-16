import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, CreditCard, Smartphone, Lock, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  const { orderData } = location.state || {};
  const [loading, setLoading] = useState(false);
  
  // State for card payment
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  
  // State for UPI payment
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("");
  
const upiApps = [
  { id: "gpay", name: "Google Pay", icon: "/upi/gpay.svg" },
  { id: "phonepe", name: "PhonePe", icon: "/upi/phonepe.svg" },
  { id: "paytm", name: "Paytm", icon: "/upi/paytm.svg" },
  { id: "bhim", name: "BHIM UPI", icon: "/upi/bhim.svg" },
  // { id: "other", name: "Other UPI Apps", icon: "/upi/upi.svg" },
];


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

  const validateUpiDetails = () => {
    if (!upiId || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g., username@upi)");
      return false;
    }
    if (!selectedUpiApp) {
      toast.error("Please select a UPI app");
      return false;
    }
    return true;
  };

  const processCardPayment = async () => {
    if (!validateCardDetails()) return;
    
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process order with card payment
      await processOrder("card");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processUpiPayment = async () => {
    if (!validateUpiDetails()) return;
    
    setLoading(true);
    
    try {
      // Simulate UPI payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process order with UPI payment
      await processOrder("upi");
    } catch (error) {
      toast.error("UPI payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processOrder = async (paymentMethod) => {
    try {
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
        
        shippingAddress: orderData.address,
        paymentMethod: paymentMethod,
        isDirectBuy: orderData.isDirectBuy || false,
        notes: '',
        discount: 0,
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      toast.success("🎉 Payment successful! Order placed.");
      
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
      <div className="flex items-center mb-6">
        <Smartphone className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">UPI Payment</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select UPI App
          </label>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
  {upiApps.map((app) => (
    <button
      key={app.id}
      onClick={() => setSelectedUpiApp(app.id)}
      className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all
        ${selectedUpiApp === app.id 
          ? "border-green-500 bg-green-50" 
          : "border-gray-300 hover:border-gray-400"
        }
      `}
    >
      <img
        src={app.icon}
        alt={app.name}
        className="w-10 h-10 object-contain mb-2"
      />
      <span className="text-sm font-medium">{app.name}</span>
    </button>
  ))}
</div>

        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="username@upi"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter your UPI ID (e.g., mobileNumber@upi, username@okicici)
          </p>
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
              Processing UPI Payment...
            </div>
          ) : (
            `Pay ₹${orderData.total.toLocaleString()}`
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