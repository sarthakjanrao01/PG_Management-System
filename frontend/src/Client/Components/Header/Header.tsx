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
    <header className="w-full font-sans z-30 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 shadow-sm">
      <div className="max-w-7xl m-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <NavLink to="/" className="text-xl font-black tracking-tight text-blue-600">
          PG Management System
        </NavLink>

        {/* Mobile Hamburger & Profile */}
        <div className="md:hidden flex items-center gap-3">
          {userData && <NotificationBell userId={userData._id} />}
          {userData && (
            <div className="relative">
              <div onClick={toggleDropdown} className="cursor-pointer">
                <Avtar name={avtarData.name} />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1">
                  <div
                    className="block px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
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
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleDropdownNavigation("/profile")}
                  >
                    Profile
                  </div>
                  <div
                    className="block px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
          <div onClick={() => setOpen(!open)} className="cursor-pointer text-slate-700">
            {open ? <IoMdClose size="1.8rem" /> : <GiHamburgerMenu size="1.8rem" />}
          </div>
        </div>

        {/* Navigation Links */}
        <div
          className={`flex md:flex-row md:items-center z-40 w-full md:w-auto left-0 bg-white absolute md:static border-b md:border-none border-slate-200 px-6 py-4 md:p-0 gap-2 md:gap-3 transition-all duration-300 ${
            open ? "top-14 block" : "top-[-490px] hidden md:flex"
          }`}
        >
          {/* Guest Links */}
          {!userData && (
            <>
              <NavLink
                to="/"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/services"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Services
              </NavLink>
              <NavLink
                to="/aboutus"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Contact
              </NavLink>
            </>
          )}

          {/* User / Tenant Links */}
          {isUser && (
            <>
              <NavLink
                to="/user/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-bold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/user/my-room"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                My Room
              </NavLink>
              <NavLink
                to="/user/history"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                History
              </NavLink>
              <NavLink
                to="/user/complaints"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Complaints
              </NavLink>
              <NavLink
                to="/user/help"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Help
              </NavLink>
            </>
          )}

          {/* PG Owner Links */}
          {isPgOwner && (
            <>
              <NavLink
                to="/owner/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-bold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/owner/add-room"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Add Room
              </NavLink>
              <NavLink
                to="/owner/complaints"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Room Issues
              </NavLink>
            </>
          )}

          {/* Maid / Staff Links */}
          {isMaid && (
            <>
              <NavLink
                to="/maid/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-bold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/maid/tasks"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Tasks
              </NavLink>
              <NavLink
                to="/maid/salary"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-1.5 rounded-lg transition ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Salary History
              </NavLink>
            </>
          )}

          {/* Bell Icon & User Profile Avatar */}
          <div className="pt-2 md:pt-0 flex items-center gap-3">
            {userData && (
              <div className="hidden md:block">
                <NotificationBell userId={userData._id} />
              </div>
            )}
            {userData ? (
              <div className="hidden md:block relative">
                <div onClick={toggleDropdown} className="cursor-pointer">
                  <Avtar name={avtarData.name} />
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1">
                    <div
                      className="block px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
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
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleDropdownNavigation("/profile")}
                    >
                      Profile
                    </div>
                    <div
                      className="block px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition shadow-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;