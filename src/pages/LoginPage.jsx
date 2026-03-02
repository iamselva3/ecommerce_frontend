import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import Logo from '../../public/Logo.png'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Brand Header */}
        <div className="text-center">
         <div className="flex justify-center">
  <div className="p-3 rounded-2xl shadow-lg">
    <img src={Logo} alt="Logo" className="w-16 h-12" />
  </div>
</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-150 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 space-y-3">
            {/* Google Login */}
            <div className="w-full overflow-hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                useOneTap
                theme="outline"
                size="large"
                width="100%"
                shape="circle"
                text="continue_with"
                logo_alignment="center"
                // className="outline-none focus:outline-none focus:ring-0"
              />
            </div>

            {/* Apple Login - Commented as per your request */}
            {/* <AppleSignin
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
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.45C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.36 4.61-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              )}
            /> */}
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="underline hover:text-gray-700">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;