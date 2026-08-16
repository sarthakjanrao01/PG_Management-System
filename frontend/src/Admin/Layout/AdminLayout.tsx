import React, { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faChevronDown, faChevronUp, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Admin } from "../Models/Admin.model";
import { getLoggedInAdmin, logoutAdmin } from "../Store/AdminAuthStore";
import Loading from "../../Shared/Components/Loading";

const AdminLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submenuMaidOpen, setSubmenuMaidOpen] = useState(false);
  const [submenuPgOpen, setSubmenuPgOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {

    const fetchLoggedInAdmin = async () => {
      try {
        const admin = await getLoggedInAdmin();
        if (!admin) {
          navigate("/adminlogin");
        } else {
          setLoggedInAdmin(admin);
        }
      } catch (error) {
        console.error("Error fetching logged in admin", error);
        navigate("/adminlogin");
      } finally {
        setLoading(false);
      }
    };
    fetchLoggedInAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/adminlogin");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size={50} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans relative">
      <div className="flex flex-1 min-h-screen">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-blue-600 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex justify-between items-center p-5 border-b border-blue-500">
            <h3 className="text-2xl font-bold tracking-tight">Admin Panel</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white hover:text-gray-200 focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
          <nav className="flex flex-col mt-4 space-y-3 px-4 overflow-y-auto pb-6 text-base">
            <NavLink
              to="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/profileapproval"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                }`
              }
            >
              Profile Approval
            </NavLink>
            <NavLink
              to="/admin/contactus"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                }`
              }
            >
              Contact Us
            </NavLink>
            <NavLink
              to="/admin/category"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                }`
              }
            >
              Category
            </NavLink>
            <NavLink
              to="/admin/subcategory"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                }`
              }
            >
              Sub Category
            </NavLink>
            <NavLink
              to="/admin/pgtype"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                }`
              }
            >
              PG Type
            </NavLink>
            <NavLink
              to="/admin/pgservices"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                }`
              }
            >
              PG
            </NavLink>

            {loggedInAdmin?.role === "SuperAdmin" && (
              <NavLink
                to="/admin/admindetail"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-blue-700 font-bold text-white" : "text-white hover:bg-blue-500"
                  }`
                }
              >
                Admin Detail
              </NavLink>
            )}

            {/* Maid Booking Submenu */}
            <div className="pt-1">
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-500 transition"
                onClick={() => setSubmenuMaidOpen(!submenuMaidOpen)}
              >
                <span className={submenuMaidOpen ? "font-bold text-white" : "text-white"}>
                  Maid Booking
                </span>
                <FontAwesomeIcon icon={submenuMaidOpen ? faChevronUp : faChevronDown} className="text-white text-xs" />
              </div>
              {submenuMaidOpen && (
                <div className="mt-1 ml-4 flex flex-col space-y-1 border-l-2 border-blue-400 pl-3">
                  <NavLink
                    to="/admin/pendingbooking"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `py-1 text-sm ${isActive ? "font-bold text-white" : "text-blue-100 hover:text-white"}`
                    }
                  >
                    Pending
                  </NavLink>
                  <NavLink
                    to="/admin/confirmedbooking"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `py-1 text-sm ${isActive ? "font-bold text-white" : "text-blue-100 hover:text-white"}`
                    }
                  >
                    Confirmed
                  </NavLink>
                  <NavLink
                    to="/admin/canceledbooking"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `py-1 text-sm ${isActive ? "font-bold text-white" : "text-blue-100 hover:text-white"}`
                    }
                  >
                    Canceled
                  </NavLink>
                </div>
              )}
            </div>

            {/* PG Booking Submenu */}
            <div className="pt-1">
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-500 transition"
                onClick={() => setSubmenuPgOpen(!submenuPgOpen)}
              >
                <span className={submenuPgOpen ? "font-bold text-white" : "text-white"}>
                  PG Booking
                </span>
                <FontAwesomeIcon icon={submenuPgOpen ? faChevronUp : faChevronDown} className="text-white text-xs" />
              </div>
              {submenuPgOpen && (
                <div className="mt-1 ml-4 flex flex-col space-y-1 border-l-2 border-blue-400 pl-3">
                  <NavLink
                    to="/admin/pgpendingbooking"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `py-1 text-sm ${isActive ? "font-bold text-white" : "text-blue-100 hover:text-white"}`
                    }
                  >
                    Pending
                  </NavLink>
                  <NavLink
                    to="/admin/pgconfirmedbooking"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `py-1 text-sm ${isActive ? "font-bold text-white" : "text-blue-100 hover:text-white"}`
                    }
                  >
                    Confirmed
                  </NavLink>
                  <NavLink
                    to="/admin/pgcanceledbooking"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `py-1 text-sm ${isActive ? "font-bold text-white" : "text-blue-100 hover:text-white"}`
                    }
                  >
                    Canceled
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full bg-white flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between bg-white px-4 md:px-6 py-4 shadow border-b border-gray-200">
            <div className="flex items-center w-full max-w-md">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-3 p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition focus:outline-none"
                aria-label="Toggle Sidebar"
              >
                <FontAwesomeIcon icon={faBars} size="lg" />
              </button>
              <input
                type="text"
                name="search"
                id="search"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
              />
            </div>

            {/* User Dropdown */}
            <div ref={adminDropdownRef} className="relative flex items-center space-x-2 text-right ml-2">
              <span
                className="text-gray-700 font-semibold cursor-pointer text-sm hidden sm:inline"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {loggedInAdmin?.name || "Admin"}
              </span>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition focus:outline-none"
              >
                <FontAwesomeIcon icon={faUser} className="text-gray-600" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md w-36 border border-gray-200 z-50 py-1">
                  <ul>
                    <li
                      onClick={handleLogout}
                      className="text-center py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition font-medium"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <section className="p-4 md:p-6 flex-grow">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;