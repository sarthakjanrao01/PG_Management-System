import React, { useEffect, useRef, useState } from "react";
import { FaBell, FaTimes, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../Lib/axios";
import { getLoggedInUser } from "../Store/LoginAuthStore";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Click / Touch outside listener to automatically close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get(`/notification/recipient/${userId}`);
      setNotifications(res.data || []);
    } catch {
      // Ignore
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.put(`/notification/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    await markAsRead(n._id);
    setOpen(false);

    try {
      const user = await getLoggedInUser();
      const role = (user?.role || "").toLowerCase();
      const isOwner = ["owner", "pgowner", "admin"].includes(role);
      const titleLower = (n.title || "").toLowerCase();
      const typeLower = (n.type || "").toLowerCase();

      // Complaint Notifications -> Redirect to Complaints Page
      if (
        typeLower.includes("complaint") ||
        titleLower.includes("complaint") ||
        titleLower.includes("maintenance")
      ) {
        if (isOwner) {
          navigate("/owner/complaints");
        } else {
          navigate("/user/complaints");
        }
        return;
      }

      // Payment / Booking Notifications -> Redirect to History / Dashboard
      if (
        typeLower.includes("payment") ||
        titleLower.includes("payment") ||
        titleLower.includes("booking")
      ) {
        if (isOwner) {
          navigate("/owner/dashboard");
        } else {
          navigate("/user/history");
        }
        return;
      }

      // Default redirect
      if (isOwner) {
        navigate("/owner/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.error("Navigation error from notification:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put(`/notification/read-all/${userId}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/notification/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      // Ignore
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await axiosInstance.delete(`/notification/clear-all/${userId}`);
      setNotifications([]);
    } catch {
      // Ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div ref={dropdownRef} className="relative font-sans">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition focus:outline-none"
        title="Notifications"
      >
        <FaBell size="1.25rem" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
              <p className="text-xs text-slate-400">{unreadCount} unread messages</p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                  title="Clear all notifications"
                >
                  <FaTrash size="0.65rem" /> Clear All
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 transition cursor-pointer hover:bg-slate-50 relative group ${
                    n.isRead ? "bg-white" : "bg-blue-50/40 font-medium"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h5 className="text-xs font-bold text-slate-800">{n.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={(e) => deleteNotification(n._id, e)}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 transition"
                        title="Remove notification"
                      >
                        <FaTimes size="0.75rem" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug pr-4">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
