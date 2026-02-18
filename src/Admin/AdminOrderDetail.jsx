import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package, Truck, CheckCircle, XCircle, Clock,
  User, Phone, MapPin, CreditCard, IndianRupee,
  ArrowLeft, Save, X, Loader, Calendar
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [trackingData, setTrackingData] = useState({
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedDelivery: ""
  });
  const [showTrackingForm, setShowTrackingForm] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const orderStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'returned', label: 'Returned', color: 'bg-gray-100 text-gray-800', icon: XCircle }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

 const fetchOrderDetails = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    
    if (data.success) {
   
      setOrder(data.data.order);
      setSelectedStatus(data.data.order.orderStatus);
      setSelectedPaymentStatus(data.data.order.paymentStatus);
      if (data.data.order.tracking) {
        setTrackingData(data.data.order.tracking);
      }
    } else {
      toast.error("Failed to load order details");
      navigate("/admin/orders");
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    toast.error("Failed to load order details");
    navigate("/admin/orders");
  } finally {
    setLoading(false);
  }
};

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.orderStatus) return;
    
    try {
      setUpdating(true);
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: selectedStatus })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Order status updated");
        fetchOrderDetails();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (selectedPaymentStatus === order.paymentStatus) return;
    
    try {
      setUpdating(true);
      const res = await fetch(`${API_URL}/api/orders/${orderId}/payment-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: selectedPaymentStatus })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Payment status updated");
        fetchOrderDetails();
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTracking = async () => {
    try {
      setUpdating(true);
      const res = await fetch(`${API_URL}/api/orders/${orderId}/tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(trackingData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Tracking information added");
        setShowTrackingForm(false);
        fetchOrderDetails();
      } else {
        toast.error(data.message || "Failed to add tracking");
      }
    } catch (error) {
      console.error("Error adding tracking:", error);
      toast.error("Failed to add tracking");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Order {order.orderId}</h1>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Order Status Update */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            >
              {orderStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={selectedStatus === order.orderStatus || updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Update
            </button>
          </div>
        </div>

        {/* Payment Status Update */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
          <div className="flex gap-3">
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            >
              {paymentStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleUpdatePayment}
              disabled={selectedPaymentStatus === order.paymentStatus || updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium flex items-center gap-2">
              <User size={16} />
              {order.shippingAddress?.fullName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium flex items-center gap-2">
              <Phone size={16} />
              {order.shippingAddress?.phone}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Shipping Address</p>
            <p className="font-medium flex items-start gap-2">
              <MapPin size={16} className="mt-1" />
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex gap-4 py-3 border-b last:border-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Size: {item.size} | Qty: {item.quantity}
                </p>
                <p className="text-sm">₹{item.price} each</p>
              </div>
              <p className="font-semibold">₹{item.totalPrice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span>₹{order.gst}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>₹{order.deliveryCharge}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tracking Information</h2>
          <button
            onClick={() => setShowTrackingForm(!showTrackingForm)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showTrackingForm ? 'Cancel' : 'Add Tracking'}
          </button>
        </div>

        {showTrackingForm ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Courier Name"
              value={trackingData.courierName}
              onChange={(e) => setTrackingData({...trackingData, courierName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Tracking Number"
              value={trackingData.trackingNumber}
              onChange={(e) => setTrackingData({...trackingData, trackingNumber: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="url"
              placeholder="Tracking URL"
              value={trackingData.trackingUrl}
              onChange={(e) => setTrackingData({...trackingData, trackingUrl: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={trackingData.estimatedDelivery}
              onChange={(e) => setTrackingData({...trackingData, estimatedDelivery: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleAddTracking}
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Save Tracking
            </button>
          </div>
        ) : (
          order.tracking?.trackingNumber ? (
            <div>
              <p><span className="font-medium">Courier:</span> {order.tracking.courierName}</p>
              <p><span className="font-medium">Tracking #:</span> {order.tracking.trackingNumber}</p>
              {order.tracking.trackingUrl && (
                <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Track Package
                </a>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No tracking information available</p>
          )
        )}
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
        <div className="space-y-3">
          {order.orderTimeline?.map((event, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
              <div>
                <p className="font-medium">{event.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;