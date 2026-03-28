import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  X, Loader, MapPin, Truck, CheckCircle, XCircle, Download,
  Upload, RefreshCw, Save, Eye, AlertCircle
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdminPincodes = () => {
  const [pincodes, setPincodes] = useState([]);
  const [filteredPincodes, setFilteredPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDeliverability, setSelectedDeliverability] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [states, setStates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    deliverable: 0,
    nonDeliverable: 0,
    states: 0
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    pincode: "",
    city: "",
    state: "",
    district: "",
    country: "India",
    isDeliverable: true,
    deliveryDays: 3,
    codAvailable: true,
    expressDelivery: false,
    expressDeliveryDays: 1,
    pickupStores: []
  });

  // Bulk upload state
  const [bulkData, setBulkData] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    fetchPincodes();
  }, [navigate]);

  useEffect(() => {
    filterPincodes();
  }, [pincodes, searchQuery, selectedState, selectedDeliverability]);

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/pincode/admin/all?page=1&limit=100000`, {
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        const pincodeList = data.data?.pincodes || [];
        setPincodes(pincodeList);
        
        // Extract unique states
        const uniqueStates = [...new Set(pincodeList.map(p => p.state).filter(Boolean))];
        setStates(uniqueStates);
        
        // Calculate stats
        calculateStats(pincodeList);
      } else {
        toast.error("Failed to load pincodes");
      }
    } catch (error) {
      console.error("Error fetching pincodes:", error);
      toast.error("Failed to load pincodes");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (pincodeList) => {
    const deliverable = pincodeList.filter(p => p.isDeliverable).length;
    const nonDeliverable = pincodeList.filter(p => !p.isDeliverable).length;
    const uniqueStates = new Set(pincodeList.map(p => p.state).filter(Boolean)).size;

    setStats({
      total: pincodeList.length,
      deliverable,
      nonDeliverable,
      states: uniqueStates
    });
  };

  const filterPincodes = () => {
    let filtered = [...pincodes];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.pincode?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.state?.toLowerCase().includes(query) ||
        p.district?.toLowerCase().includes(query)
      );
    }

    // State filter
    if (selectedState !== "all") {
      filtered = filtered.filter(p => p.state === selectedState);
    }

    // Deliverability filter
    if (selectedDeliverability !== "all") {
      const isDeliverable = selectedDeliverability === "deliverable";
      filtered = filtered.filter(p => p.isDeliverable === isDeliverable);
    }

    setFilteredPincodes(filtered);
    setCurrentPage(1);
  };

  const handleAddPincode = async () => {
    try {
      // Validate required fields
      if (!formData.pincode || !formData.city || !formData.state || !formData.district) {
        toast.error("Please fill all required fields");
        return;
      }

      if (formData.pincode.length !== 6) {
        toast.error("Pincode must be 6 digits");
        return;
      }

      const res = await fetch(`${API_URL}/api/pincode/admin/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Pincode added successfully");
        setShowAddModal(false);
        resetForm();
        fetchPincodes();
      } else {
        toast.error(data.message || "Failed to add pincode");
      }
    } catch (error) {
      console.error("Error adding pincode:", error);
      toast.error("Failed to add pincode");
    }
  };

  const handleUpdatePincode = async () => {
  try {
    // Validate required fields
    if (!formData.city || !formData.state || !formData.district) {
      toast.error("Please fill all required fields");
      return;
    }

    const res = await fetch(`${API_URL}/api/pincode/admin/${selectedPincode.pincode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Pincode updated successfully");
      setShowEditModal(false);
      setSelectedPincode(null);
      resetForm();
      fetchPincodes();
    } else {
      toast.error(data.message || "Failed to update pincode");
    }
  } catch (error) {
    console.error("Error updating pincode:", error);
    toast.error("Failed to update pincode");
  }
};

  const handleBulkUpload = async () => {
    try {
      setUploading(true);
      
      // Parse bulk data (assuming JSON format)
      let pincodesArray;
      try {
        pincodesArray = JSON.parse(bulkData);
      } catch (e) {
        // Try line by line format
        pincodesArray = bulkData.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [pincode, city, state, district] = line.split(',');
            return {
              pincode: pincode?.trim(),
              city: city?.trim(),
              state: state?.trim(),
              district: district?.trim(),
              isDeliverable: true,
              deliveryDays: 3,
              codAvailable: true
            };
          });
      }

      if (!Array.isArray(pincodesArray) || pincodesArray.length === 0) {
        toast.error("Invalid data format");
        setUploading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/pincode/admin/bulk-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ pincodes: pincodesArray })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setShowBulkModal(false);
        setBulkData("");
        fetchPincodes();
      } else {
        toast.error(data.message || "Failed to upload pincodes");
      }
    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error("Failed to upload pincodes");
    } finally {
      setUploading(false);
    }
  };

  const toggleDeliverability = async (pincode, currentStatus) => {
  try {
    // Just update the deliverability field using the same API
    const res = await fetch(`${API_URL}/api/pincode/admin/${pincode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ isDeliverable: !currentStatus })
    });

    const data = await res.json();

    if (data.success) {
      toast.success(`Pincode ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchPincodes();
    } else {
      toast.error(data.message || "Failed to update");
    }
  } catch (error) {
    console.error("Error toggling deliverability:", error);
    toast.error("Failed to update");
  }
};

  const handleEdit = (pincode) => {
    setSelectedPincode(pincode);
    setFormData({
      pincode: pincode.pincode,
      city: pincode.city || "",
      state: pincode.state || "",
      district: pincode.district || "",
      country: pincode.country || "India",
      isDeliverable: pincode.isDeliverable,
      deliveryDays: pincode.deliveryDays || 3,
      codAvailable: pincode.codAvailable !== false,
      expressDelivery: pincode.expressDelivery || false,
      expressDeliveryDays: pincode.expressDeliveryDays || 1,
      pickupStores: pincode.pickupStores || []
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      pincode: "",
      city: "",
      state: "",
      district: "",
      country: "India",
      isDeliverable: true,
      deliveryDays: 3,
      codAvailable: true,
      expressDelivery: false,
      expressDeliveryDays: 1,
      pickupStores: []
    });
  };

  const exportPincodes = () => {
    const csvContent = [
      ["Pincode", "City", "State", "District", "Deliverable", "COD", "Delivery Days"],
      ...filteredPincodes.map(p => [
        p.pincode,
        p.city,
        p.state,
        p.district,
        p.isDeliverable ? "Yes" : "No",
        p.codAvailable ? "Yes" : "No",
        p.deliveryDays
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pincodes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Pincodes exported successfully");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedState("all");
    setSelectedDeliverability("all");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPincodes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPincodes.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pincode Management</h1>
          <p className="text-gray-600 mt-1">
            Manage deliverable pincodes and delivery settings
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportPincodes}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Upload size={18} />
            Bulk Upload
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Pincode
          </button>
          <button
            onClick={fetchPincodes}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pincodes</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <MapPin size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deliverable</p>
              <p className="text-2xl font-bold text-green-600">{stats.deliverable}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Non-Deliverable</p>
              <p className="text-2xl font-bold text-red-600">{stats.nonDeliverable}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">States Covered</p>
              <p className="text-2xl font-bold text-purple-600">{stats.states}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Truck size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pincode, city, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Deliverability Filter */}
          <div>
            <select
              value={selectedDeliverability}
              onChange={(e) => setSelectedDeliverability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="deliverable">Deliverable</option>
              <option value="non-deliverable">Non-Deliverable</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <X size={18} />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Pincodes Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={40} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {filteredPincodes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pincodes found</h3>
              <p className="text-gray-600">
                {searchQuery ? "Try adjusting your search filters" : "Add your first pincode to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pincode</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">City</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">State</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">District</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Deliverable</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">COD</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Delivery Days</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((p) => (
                      <tr key={p.pincode} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono">{p.pincode}</td>
                        <td className="px-4 py-3">{p.city || '-'}</td>
                        <td className="px-4 py-3">{p.state || '-'}</td>
                        <td className="px-4 py-3">{p.district || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleDeliverability(p.pincode, p.isDeliverable)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                              ${p.isDeliverable 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                          >
                            {p.isDeliverable ? (
                              <>
                                <CheckCircle size={12} />
                                Yes
                              </>
                            ) : (
                              <>
                                <XCircle size={12} />
                                No
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${p.codAvailable 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {p.codAvailable ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{p.deliveryDays || 3} days</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Add Pincode Modal */}
      {showAddModal && (
        <PincodeModal
          title="Add New Pincode"
          formData={formData}
          setFormData={setFormData}
          onSave={handleAddPincode}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Pincode Modal */}
      {showEditModal && (
        <PincodeModal
          title="Edit Pincode"
          formData={formData}
          setFormData={setFormData}
          onSave={handleUpdatePincode}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPincode(null);
            resetForm();
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Bulk Upload Pincodes</h3>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkData("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Enter JSON array or CSV format (pincode,city,state,district per line):
              </p>
              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                rows="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder='[
  {
    "pincode": "626125",
    "city": "Srivilliputhur",
    "state": "Tamil Nadu",
    "district": "Virudhunagar"
  }
]

OR

626125,Srivilliputhur,Tamil Nadu,Virudhunagar
641006,Coimbatore,Tamil Nadu,Coimbatore'
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={uploading || !bulkData.trim()}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Pincode Modal Component
const PincodeModal = ({ title, formData, setFormData, onSave, onClose }) => {
  const [pickupStore, setPickupStore] = useState({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    distance: ""
  });

  const addPickupStore = () => {
    if (!pickupStore.storeName || !pickupStore.storeAddress) return;
    
    setFormData(prev => ({
      ...prev,
      pickupStores: [...(prev.pickupStores || []), { ...pickupStore }]
    }));
    
    setPickupStore({
      storeName: "",
      storeAddress: "",
      storePhone: "",
      distance: ""
    });
  };

  const removePickupStore = (index) => {
    setFormData(prev => ({
      ...prev,
      pickupStores: prev.pickupStores.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  maxLength="6"
                  disabled={title === "Edit Pincode"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Delivery Settings */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Delivery Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isDeliverable}
                    onChange={(e) => setFormData({ ...formData, isDeliverable: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Deliverable</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.codAvailable}
                    onChange={(e) => setFormData({ ...formData, codAvailable: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>COD Available</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.expressDelivery}
                    onChange={(e) => setFormData({ ...formData, expressDelivery: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Express Delivery</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Delivery Days</label>
                  <input
                    type="number"
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    max="10"
                  />
                </div>

                {formData.expressDelivery && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Express Days</label>
                    <input
                      type="number"
                      value={formData.expressDeliveryDays}
                      onChange={(e) => setFormData({ ...formData, expressDeliveryDays: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      max="3"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Stores */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Pickup Stores (Optional)</h4>
              
              {formData.pickupStores?.map((store, index) => (
                <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{store.storeName}</p>
                    <p className="text-xs text-gray-600">{store.storeAddress}</p>
                  </div>
                  <button
                    onClick={() => removePickupStore(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Store Name"
                  value={pickupStore.storeName}
                  onChange={(e) => setPickupStore({ ...pickupStore, storeName: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Store Address"
                  value={pickupStore.storeAddress}
                  onChange={(e) => setPickupStore({ ...pickupStore, storeAddress: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={pickupStore.storePhone}
                  onChange={(e) => setPickupStore({ ...pickupStore, storePhone: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Distance (km)"
                  value={pickupStore.distance}
                  onChange={(e) => setPickupStore({ ...pickupStore, distance: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={addPickupStore}
                  className="col-span-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Add Pickup Store
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPincodes;