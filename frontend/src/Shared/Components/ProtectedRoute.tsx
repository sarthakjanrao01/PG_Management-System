import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLoggedInUser } from "../Store/LoginAuthStore";
import { Register } from "../Models/Register";
import Loading from "./Loading";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Register | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const u = await getLoggedInUser();
        setUser(u);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || "").toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  if (!normalizedAllowed.includes(userRole)) {
    if (userRole === "superadmin") {
      // Super Admin has global superuser access across all management portals
      return <>{children}</>;
    } else if (userRole === "owner" || userRole === "pgowner" || userRole === "admin") {
      return <Navigate to="/owner/dashboard" replace />;
    } else if (userRole === "maid") {
      return <Navigate to="/maid/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
