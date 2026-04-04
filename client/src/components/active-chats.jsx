import React from "react";
import { Link } from "react-router-dom";

const ActiveChats = () => {
  const chats = [
    {
      id: 1,
      name: "Alex J.",
      age: "21",
      message: "Re: Biology Vol 1...",
      time: "5m",
      avatar: "AJ",
      isActive: true,
      verified: true,
      productId: 1
    },
    {
      id: 2,
      name: "Sarah M.",
      age: "19",
      message: "Interested in headphones",
      time: "2h",
      avatar: "SM",
      isActive: false,
      verified: true,
      productId: 2
    },
    {
      id: 3,
      name: "James D.",
      age: "20",
      message: "Sent you an offer",
      time: "1d",
      avatar: "JD",
      isActive: false,
      verified: true,
      productId: 3
    },
    {
      id: 4,
      name: "Ryan K.",
      age: "22",
      message: "About the desk lamp",
      time: "2d",
      avatar: "RK",
      isActive: false,
      verified: true,
      productId: 1
    }
  ];

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl mt-8 border-2 border-dashed border-blue-300 flex flex-col p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-400 tracking-wider">ACTIVE CHATS</h2>
      </div>

      {/* Chats List */}
      <div className="flex flex-col gap-3">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 transition-all duration-200 rounded-3xl relative shadow-sm cursor-pointer"
          >
            {/* Avatar */}
            <Link
              to={`/messages?chat=${chat.id}`}
              className="relative flex-shrink-0 cursor-pointer"
            >
              <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl shadow-md ${
                chat.id === 1 ? 'bg-orange-300 text-gray-800' : 'bg-gray-300 text-gray-800'
              }`}>
                {chat.avatar}
              </div>
              {chat.isActive && (
                <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              )}
            </Link>

            {/* Chat Info */}
            <Link
              to={`/messages?chat=${chat.id}`}
              className="ml-5 flex-1 min-w-0 cursor-pointer"
            >
              <h3 className="font-bold text-gray-900 text-lg mb-0.5">{chat.name}</h3>
              <p className="text-blue-600 text-sm font-medium">{chat.message}</p>
            </Link>

            {/* Notification Dot */}
            {chat.isActive && (
              <div className="h-3 w-3 bg-blue-600 rounded-full flex-shrink-0 shadow-sm"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveChats;