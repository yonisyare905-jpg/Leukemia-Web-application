import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signIn } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const authInfo = useAuth();
  console.log({ authInfo });

  // After successful manual login
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userData = await signIn(email, password); // gets full user from `users` table
      login(userData);
      navigate("/");

      console.log("User data after login:", userData);

    } catch (error) {
      setError(
        error.message || "failed to sign in. please check your credentials."
      );
      console.error("error ", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-h-screen mt-30 flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign In To Access Your Account.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md px-10 py-6">
          {error && (
            <div className="mb-4 p-3 text-center bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none 
                focus:ring-2 focus:ring-fuchsia-500"
                placeholder="jamal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label
                className="block text-gray-700 text-sm 
              font-semibold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none 
                focus:ring-2 focus:ring-fuchsia-500"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white 
            font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-orange-500 focus:ring-opacity-50 transition duration-200
            disabled:cursor-not-allowed disabled:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2">
            <p className="text-gray-600 text-sm">Don't have an Account? {""}</p>
            <Link
              to={"/signup"}
              className="text-fuchsia-600 hover:text-fuchsia-800 font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
