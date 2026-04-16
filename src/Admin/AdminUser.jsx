import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  Search, Filter, X, ChevronLeft, ChevronRight,
  User, Mail, Shield, Calendar, Edit2, Trash2,
  Eye, Lock, Unlock, Download, RefreshCw,
  UserPlus, Star, Loader, CheckCircle, XCircle
} from "lucide-react";
  import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active"
  });
  


  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, selectedRole, selectedStatus, selectedSort]);

  // Update edit form when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        role: selectedUser.role || "user",
        status: selectedUser.isActive !== false ? "active" : "inactive"
      });
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users`, {
        credentials: "include",
      });

      const result = await res.json();

      // 🛡️ HARD GUARDED EXTRACTION
      const usersArray = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.users)
        ? result.data.users
        : [];

      setUsers(usersArray);
      calculateStats(usersArray);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const total = userList.length;
    const admins = userList.filter(u => u.role === 'admin').length;
    const customers = userList.filter(u => u.role === 'user' || u.role === 'customer').length;
    const active = userList.filter(u => u.isActive !== false).length;
    const inactive = userList.filter(u => u.isActive === false).length;
    const newThisMonth = userList.filter(u => {
      const createdDate = new Date(u.createdAt);
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return createdDate >= firstDayOfMonth;
    }).length;

    setStats({
      total,
      admins,
      customers,
      active,
      inactive,
      newThisMonth
    });
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      const isActive = selectedStatus === "active";
      filtered = filtered.filter(u => (u.isActive !== false) === isActive);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term) ||
        u.city?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "email-asc":
        filtered.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleViewUser = async (userId) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        credentials: "include",
      });
      const result = await res.json();
      
      if (result.success) {
        console.log("sdisdid",result.data)
        setSelectedUser(result.data.user || result);
        setShowUserModal(true);
      } else {
        toast.error("Failed to load user details");
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      toast.error("Failed to load user details");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      setActionLoading(true);
      
      // Prepare update data
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        isActive: editForm.status === "active"
      };

      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("User updated successfully");
        setShowUserModal(false);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      toast.error(err.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh the list
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      // Update user with isActive field
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error("Status update failed");
      }
    } catch (err) {
      console.error("Failed to update user status:", err);
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };



const handleExportUsers = () => {
  const doc = new jsPDF();

  const tableColumn = [
    "Name",
    "Email",
    "Role",
    "Status",
    "Joined Date",
    "Last Login"
  ];

  const tableRows = filteredUsers.map(u => [
    u.name || '',
    u.email || '',
    u.role || 'user',
    u.isActive !== false ? 'Active' : 'Inactive',
    u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
    u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20
  });

  doc.text("Users Report", 14, 15);

  doc.save(`users_export_${new Date().toISOString().split('T')[0]}.pdf`);
};


  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSelectedSort("newest");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all registered users
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportUsers}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.newThisMonth}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <UserPlus size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 md:col-span-1"
          >
            <X size={18} />
            Clear
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          {/* <Loader size={40} className="animate-spin text-blue-600" /> */}
          <p className="mt-4 text-gray-600">
            <LogoLoader />
          </p>
        </div>
      ) : (
        <>
          {/* Results Info */}
          {filteredUsers.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
              </p>
            </div>
          )}

          {currentItems.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {u.name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name || 'No name'}</p>
                            {u.phone && <p className="text-xs text-gray-500">{u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-sm">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <Shield size={12} className="inline mr-1" />
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-sm ${
                          u.isActive !== false ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {u.isActive !== false ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(u._id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleViewUser(u._id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.isActive !== false
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive !== false ? <Lock size={18} /> : <Unlock size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "No users have registered yet"}
              </p>
              {(searchTerm || selectedRole !== "all" || selectedStatus !== "all") && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={i} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name || 'No name'}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedUser.role || 'user'}
                    </span>
                  </div>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{selectedUser.city || 'Not provided'}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium flex items-center gap-1 ${
                      selectedUser.isActive !== false ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedUser.isActive !== false ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Joined Date</p>
                    <p className="font-medium">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Email Verified</p>
                    <p className={`font-medium ${selectedUser.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedUser.isEmailVerified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3">Edit User</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Additional read-only fields */}
                  {selectedUser.phone && (
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={selectedUser.phone || ''}
                        disabled
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                      />
                    </div>
                  )}
                  
                  {selectedUser.city && (
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        value={selectedUser.city || ''}
                        disabled
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateUser(selectedUser._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
