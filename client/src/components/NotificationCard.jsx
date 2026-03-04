import React from "react";
import { 
  MessageCircle, 
  TrendingDown, 
  Calendar, 
  Bell, 
  CheckCheck,
  ArrowRight,
  Clock,
  Info
} from "lucide-react";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: "message",
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
      title: "NEW MESSAGE",
      content: "Alex J. asked: \"Is the price negotiable for the Sony WH-1000XM4?\"",
      time: "2 min ago",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      type: "price-drop",
      icon: <TrendingDown className="h-5 w-5 text-green-500" />,
      title: "PRICE DROP",
      content: "An item on your watchlist, Calculus II Textbook, just dropped by $15!",
      time: "45 min ago",
      bgColor: "bg-green-50"
    },
    {
      id: 3,
      type: "reminder",
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      title: "MEETUP REMINDER",
      content: "COD Meeting at Student Union Zone B starting in 30 minutes.",
      time: "2h ago",
      bgColor: "bg-orange-50"
    },
    {
      id: 4,
      type: "system",
      icon: <Info className="h-5 w-5 text-purple-500" />,
      title: "SYSTEM UPDATE",
      content: "We've added 3 new Verified Safe Meeting Zones near the South Campus dorms.",
      time: "1d ago",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="max-w-2xl w-90 bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* <Bell className="h-6 w-6 text-gray-700" /> */}
          <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
        </div>
        <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <CheckCheck className="h-4 w-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notification.bgColor} bg-opacity-30`}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="shrink-0">
                <div className={`p-2 rounded-full ${notification.bgColor} bg-opacity-50`}>
                  {notification.icon}
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
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Notifications;