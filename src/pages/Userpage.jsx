import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const [user, setUser] = useState(null);

  // editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // ui states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔐 Auth guard
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // 📥 Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        const profile = data.data?.user || data.data || data;

        setUser(profile);

        // initialize editable fields
        setName(profile.name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  // 💾 Update profile
  const handleUpdate = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      const updatedUser = data.data?.user || data.user || data;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-20 text-center">User not found</div>;
  }

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // optional but recommended: clear everything
  // localStorage.clear();

  navigate("/", { replace: true });
};


  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
    
<div className="flex items-center justify-between mb-8">
  <h1 className="text-3xl font-bold">My Profile</h1>

  <button
    onClick={handleLogout}
    className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
  >
    Logout
  </button>
</div>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">

        {/* Name */}
        <div>
          <label className="block text-sm text-gray-600">Name</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-900">{user.name}</p>
          ) : (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-900">{user.email}</p>
          ) : (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          )}
        </div>

        {/* Role (still read-only) */}
        <div>
          <label className="block text-sm text-gray-600">Role</label>
          <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm text-gray-600">Phone</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-900">{user.phone || "—"}</p>
          ) : (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm text-gray-600">Address</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-900 whitespace-pre-line">
              {user.address || "—"}
            </p>
          ) : (
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full border rounded px-3 py-2"
            />
          )}
        </div>

        {/* Buttons */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() => {
                setName(user.name || "");
                setEmail(user.email || "");
                setPhone(user.phone || "");
                setAddress(user.address || "");
                setIsEditing(false);
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
