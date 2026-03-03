import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, AlertCircle, DollarSign, Eye, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const OrdersListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.data?.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return CheckCircle;
      case 'shipped': return Package;
      case 'failed': return AlertCircle;
      case 'refunded': return DollarSign;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-purple-600 bg-purple-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.orderStatus);
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(order.orderStatus).split(' ')[0]}`} />
                        <h3 className="font-semibold text-gray-900">Order {order.orderId}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">Total Amount</p>
                        <p className="text-xl font-bold">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
               <button
  onClick={() => {
    
    navigate(`/track-order/${order._id}`);
  }}
  className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
>
  <Eye className="h-4 w-4 mr-2" />
  Track Order
</button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Items:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <img
                          key={index}
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                      {order.items?.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-sm">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersListPage;