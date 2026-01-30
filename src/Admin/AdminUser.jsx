import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        // 🛡️ HARD GUARDED EXTRACTION
        const usersArray = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.users)
          ? result.data.users
          : [];

        setUsers(usersArray);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
