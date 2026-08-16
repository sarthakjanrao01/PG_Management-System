import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getLoggedInUser, signUp, signUpCredentials } from "../../Shared/Store/LoginAuthStore";

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [userObject, setUserObject] = useState<signUpCredentials>({
    name: "",
    mobile_number: "",
    email: "",
    password: "",
    role: "user",
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    async function checkLoggedInUser() {
      try {
        const user = await getLoggedInUser();
        if (user) {
          navigate("/"); // Redirect to home page if logged in
        }
      } catch (error) {
        console.error("Error checking logged-in user:", error);
      }
    }
    checkLoggedInUser();
  }, [navigate]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, mobile_number, email, password, role } = userObject;

    // Basic validations
    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      toast.error(msg);
      return setErrorMessage(msg);
    }

    if (password !== confirmPassword) {
      const msg = "Password and Confirm Password must match.";
      toast.error(msg);
      return setErrorMessage(msg);
    }

    setLoading(true);
    setErrorMessage("");
    const toastId = toast.loading("Creating your account...");

    try {
      await signUp({
        name,
        mobile_number,
        email,
        password,
        role,
      });

      const isOwner = ["owner", "pgowner"].includes(role.toLowerCase());
      if (isOwner) {
        toast.success("Account registered! Owner accounts require approval from Super Admin before logging in.", {
          id: toastId,
          duration: 6000,
        });
      } else {
        toast.success("Account registered successfully! Please sign in.", { id: toastId });
      }

      navigate("/login");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred during registration.";
      toast.error(msg, { id: toastId, duration: 5000 });
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full pt-16 font-sans">
      <div className="max-w-screen-xl px-5 m-auto mt-10 mb-20 sm:px-4 md:px-1 w-full">
        <div className="flex items-center flex-col">
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Registration Portal
            </span>
            <h1 className="text-2xl font-black text-slate-800">Create New Account</h1>
          </div>

          <form
            className="flex flex-col md:w-[28vw] w-[80vw] items-center gap-3.5 bg-white p-8 rounded-2xl shadow-xl border border-slate-200"
            onSubmit={submitHandler}
          >
            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Full Name</label>
              <input
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition"
                type="text"
                required
                placeholder="Enter your full name"
                value={userObject.name}
                onChange={(e) => setUserObject({ ...userObject, name: e.target.value })}
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Mobile Number</label>
              <input
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition"
                type="text"
                required
                placeholder="10-digit mobile number"
                value={userObject.mobile_number.toString()}
                onChange={(e) => {
                  const parsedValue = parseInt(e.target.value, 10);
                  if (!isNaN(parsedValue)) {
                    setUserObject({ ...userObject, mobile_number: parsedValue });
                  } else if (e.target.value === "") {
                    setUserObject({ ...userObject, mobile_number: "" });
                  }
                }}
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Email Address</label>
              <input
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition"
                type="email"
                required
                placeholder="e.g. user@example.com"
                value={userObject.email}
                onChange={(e) => setUserObject({ ...userObject, email: e.target.value })}
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Password</label>
              <input
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition"
                type="password"
                required
                placeholder="At least 6 characters"
                value={userObject.password}
                onChange={(e) => setUserObject({ ...userObject, password: e.target.value })}
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Confirm Password</label>
              <input
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition"
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Account Role</label>
              <select
                className="border border-slate-300 text-slate-800 text-sm outline-none px-3.5 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 transition bg-white"
                value={userObject.role}
                required
                onChange={(e) => setUserObject({ ...userObject, role: e.target.value })}
              >
                <option value="user">Tenant User</option>
                <option value="pgOwner">PG Owner (Requires Approval)</option>
                <option value="maid">Housekeeping Maid</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-black bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-md disabled:bg-blue-300 mt-2 text-sm"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-center w-full font-bold p-3 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            <p className="text-slate-600 text-xs mt-3">
              Already Have An Account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-bold underline text-blue-600 hover:text-blue-800"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
