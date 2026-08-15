import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import Avtar from "../Utils/Avtar";
import NotificationBell from "../../../Shared/Components/NotificationBell";
import {
  getLoggedInUser,
  logoutUser,
} from "../../../Shared/Store/LoginAuthStore";
import { Register } from "../../../Shared/Models/Register";

const Header: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [avtarData, setAvtarData] = useState<Pick<Register, "name">>({
    name: "",
  });
  const [isUser, setIsUser] = useState<boolean>(false);
  const [isPgOwner, setIsPgOwner] = useState<boolean>(false);
  const [isMaid, setIsMaid] = useState<boolean>(false);
  const [userData, setUserData] = useState<Register | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      async function fetchLoggedInUser() {
        try {
          const user = await getLoggedInUser();
          setUserData(user);
          setAvtarData({ name: user.name });

          const role = (user.role || "").toLowerCase();
          if (role === "owner" || role === "pgowner" || role === "admin") {
            setIsPgOwner(true);
            setIsUser(false);
            setIsMaid(false);
          } else if (role === "maid") {
            setIsMaid(true);
            setIsUser(false);
            setIsPgOwner(false);
          } else {
            setIsUser(true);
            setIsPgOwner(false);
            setIsMaid(false);
          }
        } catch {
          console.error("User Not Logged In");
        }
      }
      fetchLoggedInUser();
    }
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutUser();
      setDropdownOpen(false);
      setOpen(false);
      setUserData(null);
      setIsPgOwner(false);
      setIsUser(false);
      setIsMaid(false);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownNavigation = (path: string): void => {
    navigate(path);
    setDropdownOpen(false);
    setOpen(false);
  };

  return (
    <header className="w-full font-sans z-50 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center relative">
        {/* Brand / Logo */}
        <NavLink
          to="/"
          onClick={() => setOpen(false)}
          className="text-xl font-black tracking-tight text-blue-600 hover:text-blue-700 transition"
        >
          PG Management System
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {!userData && (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Services
              </NavLink>
              <NavLink
                to="/aboutus"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Contact
              </NavLink>
            </>
          )}

          {isUser && (
            <>
              <NavLink
                to="/user/dashboard"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/user/my-room"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                My Room
              </NavLink>
              <NavLink
                to="/user/history"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                History
              </NavLink>
              <NavLink
                to="/user/complaints"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Complaints
              </NavLink>
              <NavLink
                to="/user/help"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Help
              </NavLink>
            </>
          )}

          {isPgOwner && (
            <>
              <NavLink
                to="/owner/dashboard"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/owner/add-room"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Add Room
              </NavLink>
              <NavLink
                to="/owner/complaints"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Room Issues
              </NavLink>
            </>
          )}

          {isMaid && (
            <>
              <NavLink
                to="/maid/dashboard"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/maid/tasks"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Tasks
              </NavLink>
              <NavLink
                to="/maid/salary"
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                Salary History
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop Profile / Login Button */}
        <div className="hidden md:flex items-center gap-3">
          {userData ? (
            <div className="relative flex items-center gap-3">
              <NotificationBell userId={userData._id} />
              <div onClick={toggleDropdown} className="cursor-pointer">
                <Avtar name={avtarData.name} />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1">
                  <div
                    className="block px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer transition"
                    onClick={() =>
                      handleDropdownNavigation(
                        isPgOwner
                          ? "/owner/dashboard"
                          : isMaid
                          ? "/maid/dashboard"
                          : "/user/dashboard"
                      )
                    }
                  >
                    Dashboard
                  </div>
                  <div
                    className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                    onClick={() => handleDropdownNavigation("/profile")}
                  >
                    Profile
                  </div>
                  <div
                    className="block px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                navigate("/login");
              }}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-2 rounded-xl text-sm transition shadow-sm"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Header Controls (Right side: Notifications, Profile avatar, Hamburger toggle) */}
        <div className="md:hidden flex items-center gap-3">
          {userData && <NotificationBell userId={userData._id} />}
          {userData && (
            <div className="relative">
              <div onClick={toggleDropdown} className="cursor-pointer">
                <Avtar name={avtarData.name} />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1">
                  <div
                    className="block px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer transition"
                    onClick={() =>
                      handleDropdownNavigation(
                        isPgOwner
                          ? "/owner/dashboard"
                          : isMaid
                          ? "/maid/dashboard"
                          : "/user/dashboard"
                      )
                    }
                  >
                    Dashboard
                  </div>
                  <div
                    className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                    onClick={() => handleDropdownNavigation("/profile")}
                  >
                    Profile
                  </div>
                  <div
                    className="block px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none transition"
          >
            {open ? <IoMdClose size="1.8rem" /> : <GiHamburgerMenu size="1.8rem" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-100 shadow-lg ${
          open ? "max-h-96 opacity-100 py-4 px-6" : "max-h-0 opacity-0 py-0 px-6 pointer-events-none"
        }`}
      >
        <div className="flex flex-col space-y-1">
          {/* Guest Mobile Links */}
          {!userData && (
            <>
              <NavLink
                to="/"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/services"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Services
              </NavLink>
              <NavLink
                to="/aboutus"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Contact
              </NavLink>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm text-center"
                >
                  Login
                </button>
              </div>
            </>
          )}

          {/* User / Tenant Mobile Links */}
          {isUser && (
            <>
              <NavLink
                to="/user/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/user/my-room"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                My Room
              </NavLink>
              <NavLink
                to="/user/history"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                History
              </NavLink>
              <NavLink
                to="/user/complaints"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Complaints
              </NavLink>
              <NavLink
                to="/user/help"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Help
              </NavLink>
            </>
          )}

          {/* PG Owner Mobile Links */}
          {isPgOwner && (
            <>
              <NavLink
                to="/owner/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/owner/add-room"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Add Room
              </NavLink>
              <NavLink
                to="/owner/complaints"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Room Issues
              </NavLink>
            </>
          )}

          {/* Maid Mobile Links */}
          {isMaid && (
            <>
              <NavLink
                to="/maid/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/maid/tasks"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Tasks
              </NavLink>
              <NavLink
                to="/maid/salary"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Salary History
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;