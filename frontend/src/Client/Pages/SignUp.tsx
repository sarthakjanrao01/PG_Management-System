import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      return setErrorMessage("Password must be at least 6 characters long.");
    }

    if (password !== confirmPassword) {
      return setErrorMessage("Password and Confirm Password must match.");
    }

    try {
      await signUp({
        name,
        mobile_number,
        email,
        password,
        role,
      });
      navigate("/login"); // Redirect to login page upon success
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="w-full h-full pt">
      <div className="max-w-screen-xl px-5 m-auto mt-10 mb-20 sm:px-4 md:px-1 w-full">
        <div className="flex items-center flex-col">
          <div className="flex md:gap-[74px] gap-8 items-center justify-center">
            <h1 className="md:text-2xl mb-5 text-sm text-blue-500 font-['open_sans'] font-semibold">
              Sign Up
            </h1>
          </div>

          <form
            className="flex flex-col md:w-[22vw] w-[62vw] items-center gap-1"
            onSubmit={submitHandler}
          >
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="text"
              required
              placeholder="Full Name"
              value={userObject.name}
              onChange={(e) =>
                setUserObject({ ...userObject, name: e.target.value })
              }
            />
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="text"
              required
              placeholder="Mobile Number"
              value={userObject.mobile_number.toString()} // Convert number to string for display
              onChange={(e) => {
                const parsedValue = parseInt(e.target.value, 10);
                if (!isNaN(parsedValue)) {
                  // Only update if input is a valid number
                  setUserObject({
                    ...userObject,
                    mobile_number: parsedValue,
                  });
                }
              }}
            />
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="email"
              required
              placeholder="Email"
              value={userObject.email}
              onChange={(e) =>
                setUserObject({ ...userObject, email: e.target.value })
              }
            />
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="password"
              required
              placeholder="Password"
              value={userObject.password}
              onChange={(e) =>
                setUserObject({ ...userObject, password: e.target.value })
              }
            />
            <input
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              type="password"
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <select
              className="border my-1 border-zinc-300 text-zinc-800 text-xs outline-none px-2 py-3 rounded-md w-full"
              value={userObject.role}
              required
              onChange={(e) =>
                setUserObject({ ...userObject, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="pgOwner">PG Owner</option>
              <option value="maid">Maid</option>
            </select>
            <button
              type="submit"
              className="px-3 my-3 py-1 w-full font-['open_sans'] text-white bg-blue-500 rounded hover:bg-white border border-blue-500 hover:text-blue-500"
            >
              Register
            </button>
            {errorMessage && (
              <div className="text-red-500 text-center w-full font-semibold mt-2 text-sm">
                ❌ {errorMessage}
              </div>
            )}
          </form>

          <p className="text-black text-sm mt-3">
            Already Have An Account?
            <button
              onClick={() => navigate("/login")}
              className="px-1 cursor-pointer text-blue-500 underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
