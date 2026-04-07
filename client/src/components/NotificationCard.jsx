import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  TrendingDown, 
  Calendar, 
  CheckCheck,
  ArrowRight,
  Clock,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { getStoredAuthToken } from "../api/http";
import { fetchNotificationFeed } from "../api/notifications";

const Notifications = ({ onMarkAllRead, onNotificationsStateChange }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const currentUserId = useMemo(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      return currentUser?._id || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      const token = getStoredAuthToken();
      if (!token) {
        setNotifications([]);
        return;
      }

      try {
        setErrorMessage("");
        const feed = await fetchNotificationFeed({ token, currentUserId });
        setNotifications(feed);
        const readMarkerKey = `notifications:lastReadAt:${currentUserId || "guest"}`;
        const lastReadAt = localStorage.getItem(readMarkerKey);
        const hasUnread = feed.some((item) => {
          if (!item?.createdAt) return false;
          if (!lastReadAt) return true;
          return new Date(item.createdAt).getTime() > new Date(lastReadAt).getTime();
        });
        if (onNotificationsStateChange) {
          onNotificationsStateChange({ hasUnread, count: feed.length });
        }
      } catch (error) {
        setErrorMessage(error.message || "Failed to load notifications");
      }
    };

    loadNotifications();
  }, [currentUserId, onNotificationsStateChange]);

  const handleMarkAllRead = () => {
    if (notifications.length === 0) {
      return;
    }

    const readMarkerKey = `notifications:lastReadAt:${currentUserId || "guest"}`;
    localStorage.setItem(readMarkerKey, new Date().toISOString());

    if (onMarkAllRead) {
      onMarkAllRead();
    }

    if (onNotificationsStateChange) {
      onNotificationsStateChange({ hasUnread: false, count: notifications.length });
    }
  };

  const typeStyles = {
    message: {
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-50",
    },
    reminder: {
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      bgColor: "bg-orange-50",
    },
    success: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-50",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      bgColor: "bg-amber-50",
    },
    system: {
      icon: <Info className="h-5 w-5 text-purple-500" />,
      bgColor: "bg-purple-50",
    },
    "price-drop": {
      icon: <TrendingDown className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-50",
    },
  };

  return (
    <div className="max-w-2xl w-90 bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* <Bell className="h-6 w-6 text-gray-700" /> */}
          <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <CheckCheck className="h-4 w-4" />
          <span>{notifications.length === 0 ? "No messages" : "Mark all as read"}</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {errorMessage && (
          <div className="p-4 text-sm text-red-600">{errorMessage}</div>
        )}

        {!errorMessage && notifications.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
        )}

        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            onClick={() => navigate(notification.route || "/messages")}
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${(typeStyles[notification.type] || typeStyles.system).bgColor} bg-opacity-30`}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="shrink-0">
                <div className={`p-2 rounded-full ${(typeStyles[notification.type] || typeStyles.system).bgColor} bg-opacity-50`}>
                  {(typeStyles[notification.type] || typeStyles.system).icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{notification.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {notification.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t rounded-b-xl bg-gray-90 border-gray-200 text-center">
        <button className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <span>View all notifications</span>
        </button>
      </div>
    </div>
  );
};

export default Notifications;