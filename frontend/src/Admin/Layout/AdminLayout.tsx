import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Admin } from "../Models/Admin.model";
import { getLoggedInAdmin, logoutAdmin } from "../Store/AdminAuthStore";
import Loading from "../../Shared/Components/Loading";

const AdminLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submenuMaidOpen, setSubmenuMaidOpen] = useState(false);
  const [submenuPgOpen, setSubmenuPgOpen] = useState(false);

  const navigate = useNavigate();

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
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-1/5 bg-blue-500 text-white flex flex-col">
          <div className="text-center p-5 border-b border-white">
            <h3 className="text-2xl font-bold">Admin Panel</h3>
          </div>
          <nav className="flex flex-col mt-4 space-y-4 px-4 text-center text-lg">
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/profileapproval" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
              Profile Approval
            </NavLink>
            <NavLink to="/admin/contactus" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
              Contact Us
            </NavLink>
            <NavLink to="/admin/category" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
              Category
            </NavLink>
            <NavLink to="/admin/subcategory" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
              Sub Category
            </NavLink>
            <NavLink to="/admin/pgtype" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
              PG Type
            </NavLink>
            <NavLink to="/admin/pgservices" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
              PG
            </NavLink>

            {loggedInAdmin?.role === "SuperAdmin" && (
              <NavLink to="/admin/admindetail" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
                Admin Detail
              </NavLink>
            )}

            {/* Maid Booking Submenu */}
            <div>
              <div className="items-center cursor-pointer" onClick={() => setSubmenuMaidOpen(!submenuMaidOpen)}>
                <span className={`pr-2 ${submenuMaidOpen ? "font-bold" : ""} text-white hover:font-bold`}>
                  Maid Booking
                </span>
                <FontAwesomeIcon icon={submenuMaidOpen ? faChevronUp : faChevronDown} className="text-white" />
              </div>
              {submenuMaidOpen && (
                <div className="mt-2 flex flex-col items-center space-y-2">
                  <NavLink to="/admin/pendingbooking" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
                    Pending
                  </NavLink>
                  <NavLink to="/admin/confirmedbooking" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
                    Confirmed
                  </NavLink>
                  <NavLink to="/admin/canceledbooking" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
                    Canceled
                  </NavLink>
                </div>
              )}
            </div>

            {/* PG Booking Submenu */}
            <div>
              <div className="items-center cursor-pointer" onClick={() => setSubmenuPgOpen(!submenuPgOpen)}>
                <span className={`pr-2 ${submenuPgOpen ? "font-bold" : ""} text-white hover:font-bold`}>
                  PG Booking
                </span>
                <FontAwesomeIcon icon={submenuPgOpen ? faChevronUp : faChevronDown} className="text-white" />
              </div>
              {submenuPgOpen && (
                <div className="mt-2 flex flex-col items-center space-y-2">
                  <NavLink to="/admin/pgpendingbooking" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
                    Pending
                  </NavLink>
                  <NavLink to="/admin/pgconfirmedbooking" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
                    Confirmed
                  </NavLink>
                  <NavLink to="/admin/pgcanceledbooking" className={({ isActive }) => isActive ? "font-bold text-white" : "text-white hover:font-bold"}>
                    Canceled
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="w-4/5 bg-white">
          {/* Header */}
          <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
            <div className="w-full sm:w-3/4 flex items-center">
              <input type="text" name="search" id="search" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Search" />
            </div>

            {/* User Dropdown */}
            <div className="relative flex items-center space-x-2 text-right">
              <span className="text-gray-700 font-semibold cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {loggedInAdmin?.name || "Admin"}
              </span>
              <FontAwesomeIcon icon={faUser} className="text-gray-500 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)} />
              {dropdownOpen && (
                <div className="absolute right-0 mt-20 bg-white shadow-lg rounded-md w-32 border border-gray-300 z-10">
                  <ul>
                    <li onClick={handleLogout} className="text-center py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md">
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <section className="p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;