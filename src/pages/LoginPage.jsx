import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [shouldLogin, setShouldLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 👇 ONLY trigger state
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setShouldLogin(true);
  };

  // 👇 Side-effects live here
  useEffect(() => {
    if (!shouldLogin) return;

    const loginUser = async () => {
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });
       

        const data = await res.json();
        console.log(data.token)

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        // // 🔐 Persist auth
        // localStorage.setItem("token", data.token);
        // localStorage.setItem("user", JSON.stringify(data.user));

        const user = data.data.user ?? {
          name: data.data.name,
          role: data.data.role,
          email: form.email,
        };

        console.log("token",data.data.token)

        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(user));

        navigate("/");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setShouldLogin(false); // reset trigger
      }
    };

    loginUser();
  }, [shouldLogin, form, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Login to your account
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
