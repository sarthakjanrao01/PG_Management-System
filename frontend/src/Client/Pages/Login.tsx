import React, { useEffect, useState } from "react";
import { getLoggedInUser, login } from "../../Shared/Store/LoginAuthStore";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // State variables for email, password, and error message
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Added error state

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem("token");
      if(token)
      {
        try {
          const user = await getLoggedInUser();
          if (user) {
            navigate("/");
          }
        } catch (error) {
          console.error("Error checking logged-in user:", error);
        }
      }
      
    };

    checkLoggedInUser();
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login({ email, password });
      navigate("/");
    } catch (error: unknown) {
      console.error("Login error:", error);
      setErrorMessage("Invalid email or password. Please try again."); // Set error message for display
    }
  };

  return (
    <div className="w-full h-full pt-16">
      <div className="max-w-screen-xl px-5 m-auto mt-10 mb-12 sm:px-4 md:px-1 w-full">
        <div className="flex items-center flex-col">
          {/* Logo and Title */}
          <div className="flex md:gap-[74px] gap-8 items-center justify-center">
            <h1 className="md:text-lg mb-5 text-sm text-blue-500 font-['open_sans'] font-semibold">
              Login
            </h1>
          </div>

          {/* Login Form */}
          <form
            className="flex flex-col md:w-[22vw] w-[62vw] items-center gap-4"
            onSubmit={handleSubmit}
          >
            {/* Email Input */}
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="email"
              placeholder="Enter email/phone number"
              name="email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password Input */}
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="password"
              placeholder="Enter your password"
              name="password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="px-3 py-1 w-full h-min font-['open_sans'] text-white bg-blue-500 rounded hover:bg-white border border-blue-500 hover:text-blue-500"
            >
              Login
            </button>

            {/* Error Message */}
            {errorMessage && (
              <div className="text-red-500 text-center w-full font-semibold mt-2 text-sm">
                ❌ {errorMessage}
              </div>
            )}

            {/* Additional Links */}
            <p className="text-blue-500 underline text-sm mt-5 cursor-pointer">
              Forget password
            </p>
            <p className="text-black text-sm mt-5">
              Don’t Have An Account?
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="px-1 cursor-pointer underline text-blue-500"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
