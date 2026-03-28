import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Home,
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Share2,
  MessageSquare,
  XCircle, 
} from "lucide-react";
import { generateInvoice } from "../../utils/pdfGenerator";

const API_URL = import.meta.env.VITE_API_URL;

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fullOrderId = orderId ? `${orderId}` : null

  const HandlePdfdownloader = () => {
   generateInvoice(order) 
  }

  // Fetch order details
  useEffect(() => {
    if (!user._id) {
      navigate("/login");
      return;
    }

    if (!fullOrderId) {
      toast.error("Order ID is required");
      navigate("/orders");
      return;
    }

    fetchOrderDetails();
  }, [fullOrderId, navigate]);

const fetchOrderDetails = async () => {
  try {
    console.log(`Fetching order: ${fullOrderId}`);
        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: "include",
        });

    const data = await response.json();
    console.log("Order API response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch order");
    }

    if (data.success) {
      // Extract order from response (handle different response structures)
      const orderData = data.data?.order || data.order || data.data;
      
      if (!orderData) {
        throw new Error("Order data not found in response");
      }

      // Add mock tracking data if not present
      const trackingData = orderData.tracking || {
        courierName: "Bluedart Express",
        trackingNumber: `TRK${fullOrderId.slice(-8)}`,
        trackingUrl: "https://www.bluedart.com/tracking",
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        shippedAt: null,
        deliveredAt: null,
      };

      setOrder({
        ...orderData,
        tracking: trackingData
      });
    } else {
      throw new Error(data.message || "Failed to fetch order");
    }
  } catch (error) {
    console.error("Fetch order error:", error);
    toast.error(error.message || "Failed to load order details");
    
    // If API fails, use mock data for demo
    setOrder(getMockOrder(fullOrderId));
  } finally {
    setLoading(false);
  }
};

  // Mock order data for demo
  const getMockOrder = (id) => {
    return {
      fullOrderId: id || "#ORD-357160-123",
      items: [{
        productId: "697a0a3d6421a9b3d3aba382",
        name: "Pant with fit losing",
        price: 1000,
        quantity: 2,
        size: "M",
        color: null,
        image: "https://iamselva1501.s3.eu-north-1.amazonaws.com/pants/1769605692417-bc0153d4-3e4f-4e65-a823-7815f68c18d6.webp",
        totalPrice: 2000,
      }],
      shippingAddress: {
        fullName: "Selva Ganesh",
        phone: "9150888318",
        street: "158, Muthaliyar Patti Street",
        city: "Srivilliputhur",
        state: "Tamil Nadu",
        pincode: "626125",
        country: "India",
        landmark: "",
      },
      paymentDetails: {
        method: "cod",
        status: "pending",
        transactionId: null,
        paidAmount: 0,
      },
      orderStatus: "pending",
      paymentStatus: "pending",
      subtotal: 2000,
      gst: 360,
      deliveryCharge: 0,
      discount: 0,
      totalAmount: 2360,
      notes: "",
      isDirectBuy: false,
      orderTimeline: [{
        status: 'pending',
        message: 'Order placed successfully',
        timestamp: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracking: {
        courierName: "Bluedart Express",
        trackingNumber: `TRK${(id || "357160123").slice(-8)}`,
        trackingUrl: "https://www.bluedart.com/tracking",
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        shippedAt: null,
        deliveredAt: null,
      },
    };
  };

  // Timeline steps based on order status
 // Timeline steps based on order status
const getTimelineSteps = () => {
  if (!order) return [];
  
  const steps = [
    {
      id: "ordered",
      title: "Order Placed",
      description: "Your order has been confirmed",
      icon: Package,
      status: "completed",
      date: order?.createdAt,
    },
    {
      id: "confirmed",
      title: "Confirmed",
      description: "Order has been confirmed and is being processed",
      icon: CheckCircle,
      status: getStepStatus(['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded']),
      date: order?.orderTimeline?.find(t => t.status === 'confirmed')?.timestamp,
    },
    {
      id: "processing",
      title: "Processing",
      description: "Preparing your order for shipment",
      icon: RefreshCw,
      status: getStepStatus(['processing', 'shipped', 'out_for_delivery', 'delivered']),
      date: order?.orderTimeline?.find(t => t.status === 'processing')?.timestamp,
    },
    {
      id: "shipped",
      title: "Shipped",
      description: "Your order is on the way",
      icon: Truck,
      status: getStepStatus(['shipped', 'out_for_delivery', 'delivered']),
      date: order?.tracking?.shippedAt || order?.orderTimeline?.find(t => t.status === 'shipped')?.timestamp,
    },
    {
      id: "out_for_delivery",
      title: "Out for Delivery",
      description: "Your order is out for delivery",
      icon: Truck,
      status: getStepStatus(['out_for_delivery', 'delivered']),
      date: order?.orderTimeline?.find(t => t.status === 'out_for_delivery')?.timestamp,
    },
  ];

  // Handle cancelled orders
  if (order?.orderStatus === "cancelled") {
    steps.push({
      id: "cancelled",
      title: "Cancelled",
      description: "Order has been cancelled",
      icon: XCircle,
      status: "failed",
      date: order?.orderTimeline?.find(t => t.status === 'cancelled')?.timestamp,
    });
    return steps;
  }

  // Handle returned orders
  if (order?.orderStatus === "returned") {
    steps.push({
      id: "delivered",
      title: "Delivered",
      description: "Order was delivered",
      icon: CheckCircle,
      status: "completed",
      date: order?.tracking?.deliveredAt || order?.orderTimeline?.find(t => t.status === 'delivered')?.timestamp,
    });
    steps.push({
      id: "returned",
      title: "Returned",
      description: "Order has been returned",
      icon: RefreshCw,
      status: "failed",
      date: order?.orderTimeline?.find(t => t.status === 'returned')?.timestamp,
    });
    return steps;
  }

  // Handle refunded orders
  if (order?.orderStatus === "refunded") {
    steps.push({
      id: "delivered",
      title: "Delivered",
      description: "Order was delivered",
      icon: CheckCircle,
      status: "completed",
      date: order?.tracking?.deliveredAt || order?.orderTimeline?.find(t => t.status === 'delivered')?.timestamp,
    });
    steps.push({
      id: "refunded",
      title: "Refunded",
      description: "Amount has been refunded",
      icon: DollarSign,
      status: "completed",
      date: order?.orderTimeline?.find(t => t.status === 'refunded')?.timestamp,
    });
    return steps;
  }

  // Handle delivered orders
  if (order?.orderStatus === "delivered") {
    steps.push({
      id: "delivered",
      title: "Delivered",
      description: "Order delivered successfully",
      icon: CheckCircle,
      status: "completed",
      date: order?.tracking?.deliveredAt || order?.orderTimeline?.find(t => t.status === 'delivered')?.timestamp,
    });
    return steps;
  }

  // For in-progress orders, add the current status indicator
  const currentStep = steps.find(step => step.status === "current");
  if (!currentStep) {
    // Add a visual indicator for the current status
    const statusMap = {
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'shipped',
      'out_for_delivery': 'out_for_delivery'
    };
    
    const currentStatus = statusMap[order?.orderStatus];
    if (currentStatus) {
      const step = steps.find(s => s.id === currentStatus);
      if (step) step.status = "current";
    }
  }

  return steps;
};

// Helper function to determine step status

const getExactDeliveryDate = () => {
  // First check if we have deliveryInfo from the order
  if (order?.deliveryInfo?.estimatedDate) {
    const date = new Date(order.deliveryInfo.estimatedDate);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  // Fallback to tracking.estimatedDelivery
  if (order?.tracking?.estimatedDelivery) {
    const date = new Date(order.tracking.estimatedDelivery);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  return "Calculating...";
};
const getStepStatus = (validStatuses) => {
  if (!order?.orderStatus) return "pending";
  
  if (validStatuses.includes(order.orderStatus)) {
    return order.orderStatus === validStatuses[0] ? "current" : "completed";
  }
  
  // Check if this step should be completed based on timeline
  const stepCompleted = order.orderTimeline?.some(t => validStatuses.includes(t.status));
  return stepCompleted ? "completed" : "pending";
};

  // Status badges with colors
  const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    processing: { color: "bg-purple-100 text-purple-800", icon: RefreshCw },
    shipped: { color: "bg-indigo-100 text-indigo-800", icon: Truck },
    out_for_delivery: { color: "bg-orange-100 text-orange-800", icon: Truck },
    delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
    returned: { color: "bg-gray-100 text-gray-800", icon: RefreshCw },
    refunded: { color: "bg-purple-100 text-purple-800", icon: DollarSign },
    failed: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="h-4 w-4 mr-2" />
      {status === 'out_for_delivery' ? 'Out for Delivery' : 
       status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
    </span>
  );
};

  const refreshTracking = async () => {
    setUpdating(true);
    try {
      await fetchOrderDetails();
      toast.success("Tracking updated");
    } catch (error) {
      toast.error("Failed to update tracking");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getEstimatedDelivery = () => {
    if (order?.tracking?.estimatedDelivery) {
      try {
        const date = new Date(order.tracking.estimatedDelivery);
        return date.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch (error) {
        return "Calculating...";
      }
    }
    return "Calculating...";
  };

  const getDeliveryProgress = () => {
    if (!order?.orderStatus) return 0;
    
    const statusOrder = ["pending", "shipped", "completed"];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    return currentIndex >= 0 ? (currentIndex + 1) * 33 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/orders")}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              View All Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Orders
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <div className="flex items-center gap-4 mt-2">
  <p className="text-gray-600">Order ID: <span className="font-mono font-medium">{order.orderId}</span></p>
  {getStatusBadge(order.orderStatus)}
</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshTracking}
                disabled={updating}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${updating ? "animate-spin" : ""}`} />
                {updating ? "Updating..." : "Refresh"}
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={HandlePdfdownloader}>
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Progress Bar */}
        {/* <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Order Progress</span>
            <span className="text-sm font-medium text-blue-600">{getDeliveryProgress()}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${getDeliveryProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Ordered</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tracking Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tracking Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Truck className="h-6 w-6 mr-2 text-blue-600" />
                Order Journey
              </h2>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-8">
                  {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = step.status === "completed";
                    const isCurrent = step.status === "current";
                    const isFailed = step.status === "failed";
                    
                    return (
                      <div key={step.id} className="relative flex items-start">
                        {/* Icon */}
                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                          ${isCompleted ? "bg-green-100 text-green-600" : 
                            isCurrent ? "bg-blue-100 text-blue-600" :
                            isFailed ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"}`}
                        >
                          <Icon className="h-6 w-6" />
                          {isCurrent && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping"></div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="ml-6 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className={`text-lg font-semibold
                                ${isCompleted ? "text-green-700" : 
                                  isCurrent ? "text-blue-700" :
                                  isFailed ? "text-red-700" : "text-gray-700"}`}
                              >
                                {step.title}
                              </h3>
                              <p className="text-gray-600 mt-1">{step.description}</p>
                            </div>
                            {step.date && (
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(step.date)}
                              </span>
                            )}
                          </div>
                          
                          {/* Status indicator */}
                          {isCurrent && (
                            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                              <Clock className="h-3 w-3 mr-2" />
                              In Progress
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Timeline (History) */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
              <div className="space-y-4">
                {order.orderTimeline?.map((event, index) => (
                  <div key={index} className="flex items-start border-l-2 border-blue-500 pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900">{event.message}</p>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                          ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            event.status === 'completed' ? 'bg-green-100 text-green-800' :
                            event.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Details & Shipping */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                Shipping Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">{order.shippingAddress?.fullName || "N/A"}</p>
                  <p className="text-gray-600">{order.shippingAddress?.street || "N/A"}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress?.city || "N/A"}, {order.shippingAddress?.state || "N/A"} - {order.shippingAddress?.pincode || "N/A"}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress?.country || "India"}</p>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {order.shippingAddress?.phone || "N/A"}
                </div>
                
                {order.shippingAddress?.landmark && (
                  <div>
                    <p className="text-sm text-gray-500">Landmark</p>
                    <p className="text-gray-600">{order.shippingAddress.landmark}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <img
                      src={item.image || "https://via.placeholder.com/64"}
                      alt={item.name || "Product"}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/64";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name || "Unnamed Product"}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Size: {item.size || "M"}</span>
                        <span className="mx-2">•</span>
                        <span>Qty: {item.quantity || 1}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">₹{(item.totalPrice || 0).toLocaleString()}</span>
                        <span className="text-sm text-gray-500">₹{(item.price || 0).toLocaleString()} each</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Tracking Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment & Tracking</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">
                    {order.paymentDetails?.method === "cod" ? "Cash on Delivery" : 
                     order.paymentDetails?.method === "card" ? "Credit/Debit Card" : 
                     order.paymentDetails?.method === "upi" ? "UPI Payment" : 
                     order.paymentDetails?.method || "N/A"}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === "paid" ? "text-green-600" : 
                    order.paymentStatus === "pending" ? "text-yellow-600" : 
                    "text-red-600"
                  }`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || "Unknown"}
                  </span>
                </div>
                
                {/* {order.tracking?.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                    <div className="flex items-center justify-between">
                      <code className="font-mono bg-gray-100 px-3 py-1 rounded">
                        {order.tracking.trackingNumber}
                      </code>
                      <button 
                        onClick={() => window.open(order.tracking.trackingUrl, "_blank")}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                )} */}
                
                {/* {order.tracking?.courierName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Courier</span>
                    <span className="font-medium">{order.tracking.courierName}</span>
                  </div>
                )} */}
                {order?.deliveryInfo?.estimatedDays && (
  <div className="flex justify-between">
    <span className="text-gray-600">Delivery in</span>
    <span className="font-medium">{order.deliveryInfo.estimatedDays} days</span>
  </div>
)}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <span className="font-medium text-green-600 text-right">{getExactDeliveryDate()}</span>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{(order.gst || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>{(order.deliveryCharge || 0) === 0 ? "FREE" : `₹${order.deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{(order.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                If you have any questions about your order or need support, we're here to help.
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;