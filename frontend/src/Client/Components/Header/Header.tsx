import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import Avtar from "../Utils/Avtar";
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

  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token)
    {
      async function fetchLoggedInUser() {
        try {
          const user = await getLoggedInUser();
          setUserData(user);
          setAvtarData({ name: user.name });
  
          if (user.role === "user") {
            setIsUser(true);
            setIsPgOwner(false);
            setIsMaid(false);
          } else if (user.role === "pgOwner") {
            setIsUser(false);
            setIsPgOwner(true);
            setIsMaid(false);
          } else if (user.role === "maid") {
            setIsUser(false);
            setIsPgOwner(false);
            setIsMaid(true);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.error("User Not Logged In");
        }

      }fetchLoggedInUser();
    }
    else{
      navigate("/");
    }
    
    
  }, [navigate]);

  // Handle logout
  const handleLogout = async (): Promise<void> => {
    try {
      await logoutUser();
      setDropdownOpen(false);
      setUserData(null);
      setIsPgOwner(false);
      setIsMaid(false);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Toggle the avatar dropdown menu
  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle dropdown navigation
  const handleDropdownNavigation = (path: string): void => {
    navigate(path); // Navigate to the specified path
    setDropdownOpen(false); // Close the dropdown
    setOpen(false); // Close the mobile menu (if open)
  };

  return (
    <header className="w-full font-['open_sans'] z-20 bg-zinc-100 fixed md:px-6 lg:px-[53px]">
      <div className="text-center max-w-screen-xl m-auto bg-[#F4F4F5] pt-4 sm:px-4 md:px-1 py-2 px-5 md:flex justify-between items-center">
        <NavLink to="/" className="pt-2 text-2xl font-semibold">
          <h1 className="text-blue-500 text-start">Management System</h1>
        </NavLink>

        {/* Hamburger Menu */}
        <div className="md:hidden flex items-center gap-2 absolute top-4 right-6 cursor-pointer">
          {userData && (
            <div className="relative">
              <div onClick={toggleDropdown}>
                <Avtar name={avtarData.name} />
              </div>
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
                  <ul className="py-1">
                    <li
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleDropdownNavigation("/profile")}
                    >
                      Profile
                    </li>
                    <li
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          <div onClick={() => setOpen(!open)}>
            {open ? (
              <IoMdClose size={"1.8rem"} />
            ) : (
              <GiHamburgerMenu size={"1.8rem"} />
            )}
          </div>
        </div>

        {/* Navlinks */}
        <div
          className={`flex md:flex-row sm:mt-0 md:items-center z-[-1] md:z-auto w-full md:w-auto left-0 bg-zinc-100 absolute md:static gap-5 flex-col transition-all duration-500 ease-in ${
            open ? "top-[55px] " : "top-[-490px]"
          }`}
        >
          {[
            { text: "Home", path: "/" },
            { text: "Contact", path: "/contact" },
            { text: "About Us", path: "/aboutus" },
          ].map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => setOpen(!open)}
              className={({ isActive }) =>
                `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                  isActive ? "text-blue-500" : "text-zinc-900"
                } hover:text-white hover:bg-blue-500 px-2 py-2`
              }
            >
              {item.text}
            </NavLink>
          ))}

          {/* Conditional NavLinks for User, Maid, and PG Owner */}
          {isUser && (
            <>
              <NavLink
                to="/mymaidbooking"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                Maid Booking
              </NavLink>
              <NavLink
                to="/maidbooking"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                Hire Maid
              </NavLink>
              <NavLink
                to="/mypgbooking"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                PG Booking
              </NavLink>
              <NavLink
                to="/allavailablepg"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                PG Rent
              </NavLink>
            </>
          )}

          {isMaid && (
            <>
              <NavLink
                to="/maidconfirmbooking"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                Maid Booking
              </NavLink>
              <NavLink
                to="/booking"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                Available Booking
              </NavLink>
              <NavLink
                to="/services"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                Maid Services
              </NavLink>
            </>
          )}

          {isPgOwner && (
            <>
              <NavLink
                to="/recievedpgbooking"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                Recieved Booking
              </NavLink>
              <NavLink
                to="/pgservices"
                onClick={() => setOpen(!open)}
                className={({ isActive }) =>
                  `md:text-md text-base text-center md:text-left font-bold tracking-tight font-['open_sans'] ${
                    isActive ? "text-blue-500" : "text-zinc-900"
                  } hover:text-white hover:bg-blue-500 px-2 py-2`
                }
              >
                Pg Services
              </NavLink>
            </>
          )}

          <div className="text-center text-md font-medium pt-1 pb-2 md:mb-0 md:text-left">
            {userData ? (
              <div className="hidden md:block relative">
                <div onClick={toggleDropdown} className="cursor-pointer">
                  <Avtar name={avtarData.name} />
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg">
                    <ul className="py-1">
                      <li
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleDropdownNavigation("/profile")}
                      >
                        Profile
                      </li>
                      <li
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                        onClick={handleLogout}
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="md:px-6 md:py-2 px-3 py-1 w-max h-min font-['open_sans'] text-white bg-blue-500 rounded hover:bg-white border border-blue-500 hover:text-blue-400"
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