import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setShouldLogin(true);
  };

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
        console.log(data.token);

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        const user = data.data.user ?? {
          name: data.data.name,
          role: data.data.role,
          email: form.email,
        };

        console.log("token", data.data.token);

        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(user));

        navigate("/");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setShouldLogin(false);
      }
    };

    loginUser();
  }, [shouldLogin, form, navigate]);

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google login failed");
      }

      const user = data.data.user ?? {
        name: data.data.name,
        email: data.data.email,
        role: data.data.role || 'user',
      };

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Login Success
  const handleAppleSuccess = async (response) => {
    try {
      setLoading(true);
      
      const res = await fetch(`${API_URL}/api/auth/apple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: response.authorization.code,
          id_token: response.authorization.id_token,
          user: response.user,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Apple login failed");
      }

      const user = data.data.user ?? {
        name: data.data.name,
        email: data.data.email,
        role: data.data.role || 'user',
      };

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          {/* Google Login */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            useOneTap
            theme="outline"
            size="large"
            width="100%"
            shape="circle"
            text="continue_with"
          />

          {/* Apple Login */}
          <AppleSignin
            authOptions={{
              clientId: import.meta.env.REACT_APP_APPLE_CLIENT_ID,
              scope: 'email name',
              redirectURI: window.location.origin,
              state: 'state',
              nonce: 'nonce',
              usePopup: true,
            }}
            onSuccess={handleAppleSuccess}
            onError={(error) => setError("Apple login failed: " + error)}
            render={(props) => (
              <button
                onClick={props.onClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.45C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.36 4.61-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>
            )}
          />
        </div>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;