import React from "react";

const ActiveChats = () => {
  const chats = [
    {
      id: 1,
      name: "Sarah M.",
      message: "Re: Biology Vol 1...",
      time: "5m",
      avatar: "SM",
      isActive: true
    },
    {
      id: 2,
      name: "JD",
      message: "James Doe",
      preview: "Sent you an offer",
      time: "2h",
      avatar: "JD",
      isActive: false
    }
  ];

  return (
    <div className="w-80 bg-white border rounded-2xl mt-8 border-gray-200  flex flex-col">
      {/* Header */}
      <div className="p-4 border rounded-t-2xl border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">ACTIVE CHATS</h2>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
          >
            {/* Avatar */}
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-medium text-sm ${
              chat.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {chat.avatar}
            </div>

            {/* Chat Info */}
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              
              {/* Message Preview */}
              <div className="flex items-center">
                {chat.preview ? (
                  <>
                    <p className="text-sm text-gray-600">{chat.message}</p>
                    <span className="text-sm text-gray-400 ml-1">•</span>
                    <p className="text-sm text-gray-400 ml-1 truncate">{chat.preview}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 truncate">{chat.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optional: Active indicator */}
      {/* <div className="p-2 text-xs text-gray-400 text-center border-t border-gray-200">
        2 active conversations
      </div> */}
    </div>
  );
};

export default ActiveChats;