import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInAdmin, loginAdmin } from "../../Admin/Store/AdminAuthStore";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  // State variables for email, password, error message, and password visibility
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false); // Track password visibility

  // Check if user is already logged in
  useEffect(() => {
    async function checkLoggedInAdmin() {
      try {
        const admin = await getLoggedInAdmin();
        if (admin) {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error checking logged-in user:", error);
      }
    }
    checkLoggedInAdmin();
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await loginAdmin({ email, password });
      console.log("Login response:", response);
      navigate("/admin/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);
      setErrorMessage("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="w-full h-full pt-16">
      <div className="max-w-screen-xl px-5 m-auto mt-10 mb-20 sm:px-4 md:px-1 w-full">
        <div className="flex items-center flex-col">
          <div className="flex md:gap-[74px] gap-8 items-center justify-center">
            <h1 className="md:text-lg mb-5 text-sm text-blue-500 font-['open_sans'] font-semibold">
              Admin Login
            </h1>
          </div>

          <form
            className="flex flex-col md:w-[22vw] w-[62vw] items-center gap-4"
            onSubmit={handleSubmit}
          >
            {/* Email Input */}
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="text"
              required
              placeholder="Enter email/phone number"
              name="email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password Input with Toggle */}
            <div className="relative w-full">
              <input
                className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
                type={passwordVisible ? "text" : "password"}
                required
                placeholder="Enter your password"
                name="password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {passwordVisible ? (
                  <span><FontAwesomeIcon icon={faEye}/></span>
                ) : (
                  <span><FontAwesomeIcon icon={faEyeSlash} /></span>
                )}
              </button>
            </div>

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

export default AdminLogin;