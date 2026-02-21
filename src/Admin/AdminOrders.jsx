import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package, Search, Filter, ChevronLeft, ChevronRight,
  Eye, Truck, CheckCircle, XCircle, Clock,
  Download, RefreshCw, Calendar, User, Phone,
  MapPin, CreditCard, IndianRupee, ArrowLeft,
  Edit, Save, X, Loader, AlertCircle, Printer,
  FileText, FileSpreadsheet, CalendarRange,
  ChevronsLeft, ChevronsRight
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportType, setExportType] = useState('filtered');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 25, 50, 100];
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Status options
  const orderStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'returned', label: 'Returned', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    { value: 'refunded', label: 'Refunded', color: 'bg-pink-100 text-pink-800', icon: IndianRupee }
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
    fetchOrders();
    fetchStats();
  }, [token, navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus, selectedPaymentStatus, dateRange]);

  // Reset to first page when filters change or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        const ordersArray = data.data?.orders || [];
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/stats/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data || {});
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filterOrders = () => {
    if (!orders || !Array.isArray(orders)) {
      console.log("Orders is not an array yet:", orders);
      setFilteredOrders([]);
      return;
    }
    
    let filtered = [...orders];

    // Search by order ID or customer name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId?.toLowerCase().includes(query) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(query) ||
        order.shippingAddress?.phone?.includes(query) ||
        order.items?.some(item => item.name?.toLowerCase().includes(query))
      );
    }

    // Filter by order status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(order => order.orderStatus === selectedStatus);
    }

    // Filter by payment status
    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter(order => order.paymentStatus === selectedPaymentStatus);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        switch(dateRange) {
          case "today":
            return orderDate >= today;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredOrders(filtered);
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setSelectedOrder(data.data);
        setShowOrderModal(true);
      } else {
        toast.error("Failed to load order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, message = "") => {
    try {
      setUpdatingStatus(true);
      
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          message: message || `Order ${newStatus.replace(/_/g, ' ')}`
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
        }
        
        fetchStats();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      
      const res = await fetch(`${API_URL}/api/orders/${orderId}/payment-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, paymentStatus: newStatus } : order
        ));
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, paymentStatus: newStatus }));
        }
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddTracking = async (orderId, trackingData) => {
    try {
      setUpdatingStatus(true);
      
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
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, tracking: trackingData }));
        }
      } else {
        toast.error(data.message || "Failed to add tracking");
      }
    } catch (error) {
      console.error("Error adding tracking:", error);
      toast.error("Failed to add tracking");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Enhanced export function
  const handleExportOrders = async () => {
    try {
      setExportLoading(true);
      
      let dataToExport = [];
      let exportTitle = '';
      let fileName = '';
      
      // Determine which data to export
      if (exportType === 'filtered') {
        dataToExport = filteredOrders;
        exportTitle = 'Filtered Orders Report';
        fileName = `filtered_orders_${new Date().toISOString().split('T')[0]}`;
      } else if (exportType === 'dateRange' && exportDateRange.startDate && exportDateRange.endDate) {
        // Filter by custom date range
        const start = new Date(exportDateRange.startDate);
        const end = new Date(exportDateRange.endDate);
        end.setHours(23, 59, 59, 999);
        
        dataToExport = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start && orderDate <= end;
        });
        
        exportTitle = `Orders Report (${new Date(exportDateRange.startDate).toLocaleDateString()} - ${new Date(exportDateRange.endDate).toLocaleDateString()})`;
        fileName = `orders_${exportDateRange.startDate}_to_${exportDateRange.endDate}`;
      } else {
        dataToExport = orders;
        exportTitle = 'All Orders Report';
        fileName = `all_orders_${new Date().toISOString().split('T')[0]}`;
      }
      
      if (dataToExport.length === 0) {
        toast.warning("No orders to export in the selected range");
        return;
      }
      
      if (exportFormat === 'pdf') {
        generatePDF(dataToExport, exportTitle, fileName);
      } else {
        generateCSV(dataToExport, fileName);
      }
      
      setShowExportModal(false);
      toast.success(`${dataToExport.length} orders exported successfully`);
      
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export orders");
    } finally {
      setExportLoading(false);
    }
  };

  // PDF Generation function
  const generatePDF = (ordersData, title, fileName) => {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add generation date and filters info
    doc.setFontSize(10);
    doc.setTextColor(100);
    let yOffset = 30;
    
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yOffset);
    yOffset += 7;
    
    // Add applied filters info
    const filters = [];
    if (selectedStatus !== 'all') filters.push(`Status: ${selectedStatus}`);
    if (selectedPaymentStatus !== 'all') filters.push(`Payment: ${selectedPaymentStatus}`);
    if (dateRange !== 'all') filters.push(`Date Range: ${dateRange}`);
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);
    
    if (filters.length > 0) {
      doc.text(`Applied Filters: ${filters.join(' | ')}`, 14, yOffset);
      yOffset += 7;
    }
    
    // Summary statistics
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    doc.text(`Total Orders: ${totalOrders} | Total Revenue: ₹${totalRevenue.toLocaleString()} | Avg Order Value: ₹${avgOrderValue.toFixed(2)}`, 14, yOffset);
    yOffset += 10;
    
    // Prepare table data
    const tableColumn = [
      "Order ID", 
      "Date", 
      "Customer", 
      "Phone", 
      "Items", 
      "Subtotal", 
      "GST", 
      "Delivery", 
      "Total", 
      "Status", 
      "Payment"
    ];
    
    const tableRows = ordersData.map(order => [
      order.orderId,
      new Date(order.createdAt).toLocaleDateString(),
      order.shippingAddress?.fullName || 'N/A',
      order.shippingAddress?.phone || 'N/A',
      order.items?.length || 0,
      `₹${(order.subtotal || 0).toFixed(2)}`,
      `₹${(order.gst || 0).toFixed(2)}`,
      `₹${(order.deliveryCharge || 0).toFixed(2)}`,
      `₹${(order.totalAmount || 0).toFixed(2)}`,
      order.orderStatus?.replace(/_/g, ' ') || 'N/A',
      order.paymentStatus || 'N/A'
    ]);
    
    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yOffset,
      styles: { 
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      },
      margin: { top: yOffset, left: 10, right: 10 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber}`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }
    });
    
    // Add summary by status
    const finalY = doc.lastAutoTable.finalY || yOffset;
    
    if (ordersData.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('Summary by Status:', 14, finalY + 10);
      
      const statusSummary = ordersData.reduce((acc, order) => {
        const status = order.orderStatus || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      let summaryY = finalY + 15;
      Object.entries(statusSummary).forEach(([status, count]) => {
        doc.setFontSize(8);
        doc.text(`${status.replace(/_/g, ' ')}: ${count} orders`, 14, summaryY);
        summaryY += 5;
      });
      
      // Add payment summary
      doc.setFontSize(10);
      doc.text('Summary by Payment:', 14, summaryY + 5);
      
      const paymentSummary = ordersData.reduce((acc, order) => {
        const payment = order.paymentStatus || 'unknown';
        acc[payment] = (acc[payment] || 0) + 1;
        return acc;
      }, {});
      
      summaryY += 10;
      Object.entries(paymentSummary).forEach(([payment, count]) => {
        doc.setFontSize(8);
        doc.text(`${payment}: ${count} orders`, 14, summaryY);
        summaryY += 5;
      });
    }
    
    doc.save(`${fileName}.pdf`);
  };

  // CSV Generation function
  const generateCSV = (ordersData, fileName) => {
    const csvContent = [
      ["Order ID", "Date", "Customer", "Phone", "Email", "Items Count", "Subtotal", "GST", "Delivery Charge", "Total", "Order Status", "Payment Status", "Address"],
      ...ordersData.map(order => [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString(),
        order.shippingAddress?.fullName || 'N/A',
        order.shippingAddress?.phone || 'N/A',
        order.user?.email || 'N/A',
        order.items?.length || 0,
        order.subtotal || 0,
        order.gst || 0,
        order.deliveryCharge || 0,
        order.totalAmount || 0,
        order.orderStatus || 'N/A',
        order.paymentStatus || 'N/A',
        `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedPaymentStatus("all");
    setDateRange("all");
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const getStatusBadge = (status, type = 'order') => {
    const options = type === 'order' ? orderStatusOptions : paymentStatusOptions;
    const option = options.find(opt => opt.value === status);
    
    if (!option) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
          {status}
        </span>
      );
    }
    
    const Icon = option.icon || Clock;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
        <Icon size={12} />
        {option.label}
      </span>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage all customer orders
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.revenue?.toLocaleString() || '0'}`}
          icon={IndianRupee}
          color="bg-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Order Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {orderStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payments</option>
              {paymentStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedStatus !== "all" || selectedPaymentStatus !== "all" || dateRange !== "all") && (
          <div className="flex justify-end mt-3">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X size={14} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Export Orders</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Export Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data to Export
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="filtered">Currently Filtered Orders ({filteredOrders.length})</option>
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="dateRange">Custom Date Range</option>
                </select>
              </div>

              {/* Date Range Selection */}
              {exportType === 'dateRange' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exportDateRange.startDate}
                      onChange={(e) => setExportDateRange({...exportDateRange, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      max={exportDateRange.endDate || undefined}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exportDateRange.endDate}
                      onChange={(e) => setExportDateRange({...exportDateRange, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={exportDateRange.startDate || undefined}
                    />
                  </div>
                </div>
              )}

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="text-blue-600"
                    />
                    <FileText size={16} />
                    PDF
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="text-blue-600"
                    />
                    <FileSpreadsheet size={16} />
                    CSV
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportOrders}
                disabled={exportLoading || (exportType === 'dateRange' && (!exportDateRange.startDate || !exportDateRange.endDate))}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {searchQuery ? "Try adjusting your search filters" : "No orders have been placed yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium">{order.orderId}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order.orderStatus, 'order')}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order.paymentStatus, 'payment')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {filteredOrders.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">
                  of {filteredOrders.length} orders
                </span>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* First page */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First Page"
                  >
                    <ChevronsLeft size={18} />
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-600">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next page */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last Page"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              )}

              {/* Showing info */}
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePaymentStatus}
          onAddTracking={handleAddTracking}
          updatingStatus={updatingStatus}
          orderStatusOptions={orderStatusOptions}
          paymentStatusOptions={paymentStatusOptions}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="flex items-center gap-4">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Order Details Modal Component (unchanged - keeping it the same as before)
const OrderDetailsModal = ({ 
  order, 
  onClose, 
  onUpdateStatus, 
  onUpdatePayment,
  onAddTracking,
  updatingStatus,
  orderStatusOptions,
  paymentStatusOptions 
}) => {
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.paymentStatus);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [trackingData, setTrackingData] = useState({
    courierName: order.tracking?.courierName || "",
    trackingNumber: order.tracking?.trackingNumber || "",
    trackingUrl: order.tracking?.trackingUrl || "",
    estimatedDelivery: order.tracking?.estimatedDelivery || ""
  });

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.orderStatus) {
      onUpdateStatus(order._id, selectedStatus);
    }
  };

  const handlePaymentUpdate = () => {
    if (selectedPaymentStatus !== order.paymentStatus) {
      onUpdatePayment(order._id, selectedPaymentStatus);
    }
  };

  const handleTrackingSubmit = () => {
    onAddTracking(order._id, trackingData);
    setShowTrackingForm(false);
  };

  const getStatusBadge = (status, type = 'order') => {
    const options = type === 'order' ? orderStatusOptions : paymentStatusOptions;
    const option = options.find(opt => opt.value === status);
    
    if (!option) return null;
    
    const Icon = option.icon || Clock;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
        <Icon size={12} />
        {option.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">Order ID: {order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Order Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package size={18} />
                Order Status
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {orderStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={selectedStatus === order.orderStatus || updatingStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
              <div className="mt-2">
                Current: {getStatusBadge(order.orderStatus, 'order')}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard size={18} />
                Payment Status
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {paymentStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={handlePaymentUpdate}
                  disabled={selectedPaymentStatus === order.paymentStatus || updatingStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Update
                </button>
              </div>
              <div className="mt-2">
                Current: {getStatusBadge(order.paymentStatus, 'payment')}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User size={18} />
              Customer Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone size={14} />
                  {order.shippingAddress?.phone}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Shipping Address</p>
                <p className="font-medium flex items-start gap-1">
                  <MapPin size={14} className="mt-1 flex-shrink-0" />
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}, {order.shippingAddress?.country}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package size={18} />
              Order Items
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 py-3 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.size && `Size: ${item.size} | `}
                      {item.color && `Color: ${item.color}`}
                    </p>
                    <p className="text-sm">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.totalPrice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST</span>
                  <span>₹{order.gst?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>₹{order.deliveryCharge?.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck size={18} />
                Tracking Information
              </h3>
              <button
                onClick={() => setShowTrackingForm(!showTrackingForm)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showTrackingForm ? 'Cancel' : 'Add Tracking'}
              </button>
            </div>

            {showTrackingForm ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Courier Name"
                  value={trackingData.courierName}
                  onChange={(e) => setTrackingData({...trackingData, courierName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Tracking Number"
                  value={trackingData.trackingNumber}
                  onChange={(e) => setTrackingData({...trackingData, trackingNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="url"
                  placeholder="Tracking URL"
                  value={trackingData.trackingUrl}
                  onChange={(e) => setTrackingData({...trackingData, trackingUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  value={trackingData.estimatedDelivery}
                  onChange={(e) => setTrackingData({...trackingData, estimatedDelivery: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleTrackingSubmit}
                    disabled={updatingStatus}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Save Tracking
                  </button>
                </div>
              </div>
            ) : (
              order.tracking?.trackingNumber ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="text-gray-600">Courier:</span> {order.tracking.courierName}</p>
                  <p><span className="text-gray-600">Tracking #:</span> {order.tracking.trackingNumber}</p>
                  {order.tracking.trackingUrl && (
                    <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Track Package
                    </a>
                  )}
                  {order.tracking.estimatedDelivery && (
                    <p><span className="text-gray-600">Est. Delivery:</span> {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tracking information available</p>
              )
            )}
          </div>

          {/* Order Timeline */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock size={18} />
              Order Timeline
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {order.orderTimeline?.map((event, index) => (
                <div key={index} className="flex gap-3 py-2 border-b last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1">
                    <p className="font-medium">{event.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;