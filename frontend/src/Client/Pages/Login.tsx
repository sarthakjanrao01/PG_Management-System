import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser, login } from "../../Shared/Store/LoginAuthStore";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const redirectByRole = (role: string) => {
    const r = (role || "").toLowerCase();
    if (r === "superadmin") {
      navigate("/superadmin/dashboard");
    } else if (r === "owner" || r === "pgowner" || r === "admin") {
      navigate("/owner/dashboard");
    } else if (r === "maid") {
      navigate("/maid/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = await getLoggedInUser();
          if (user) {
            redirectByRole(user.role);
          }
        } catch (error) {
          console.error("Error checking logged-in user:", error);
        }
      }
    };

    checkLoggedInUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const toastId = toast.loading("Authenticating user...");

    try {
      await login({ email, password });
      toast.success("Login successful!", { id: toastId });
      const user = await getLoggedInUser();
      if (user) {
        redirectByRole(user.role);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const msg = error?.message || "Invalid email or password. Please try again.";
      toast.error(msg, { id: toastId, duration: 5000 });
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full pt-16 font-sans">
      <div className="max-w-screen-xl px-5 m-auto mt-10 mb-12 sm:px-4 md:px-1 w-full">
        <div className="flex items-center flex-col">
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              User Portal
            </span>
            <h1 className="text-2xl font-black text-slate-800">Account Login</h1>
          </div>

          <form
            className="flex flex-col md:w-[28vw] w-[80vw] items-center gap-4 bg-white p-8 rounded-2xl shadow-xl border border-slate-200"
            onSubmit={handleSubmit}
          >
            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Email Address</label>
              <input
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition"
                type="email"
                required
                placeholder="e.g. admin@gmail.com"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Password</label>
              <input
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition"
                type="password"
                required
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-black bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md disabled:bg-blue-300 mt-2 text-sm"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-center w-full font-bold p-3 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            <p className="text-slate-600 text-xs mt-3">
              Don’t Have An Account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-bold underline text-blue-600 hover:text-blue-800"
              >
                Sign Up Now
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
