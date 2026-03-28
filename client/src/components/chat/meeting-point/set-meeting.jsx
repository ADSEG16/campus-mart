import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Calendar, Clock, Shield, Check, X } from "lucide-react";

const MeetingPoint = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { userName, itemName, conversationId } = location.state || { 
    userName: "Alex Johnson", 
    itemName: "Organic Chemistry Textbook",
    conversationId: id 
  };
  
  const [selected, setSelected] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showAllZones, setShowAllZones] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allZones = [
    {
      id: 1,
      name: "Main Library Entrance",
      address: "345 University Drive, Campus Center",
      tags: ["CCTV ACTIVE", "POPULAR SPOT"],
      active: true,
    },
    {
      id: 2,
      name: "Student Union Hub",
      address: "East Wing, Ground Floor Lounge",
      tags: ["CCTV ACTIVE", "24/7 SECURITY"],
    },
    {
      id: 3,
      name: "Campus Center Food Court",
      address: "2nd Floor, Campus Center",
      tags: ["HIGH TRAFFIC", "CCTV ACTIVE"],
    },
    {
      id: 4,
      name: "Science Building Lobby",
      address: "Science Building, Main Entrance",
      tags: ["WELL-LIT", "SECURITY PATROL"],
    },
    {
      id: 5,
      name: "Engineering Quad",
      address: "Engineering Building, North Entrance",
      tags: ["CCTV ACTIVE", "STUDENT HUB"],
    },
    {
      id: 6,
      name: "Performing Arts Center",
      address: "PAC Building, Main Lobby",
      tags: ["HIGH TRAFFIC", "WELL-LIT"],
    }
  ];

  const displayedZones = showAllZones ? allZones : allZones.slice(0, 2);
  
  const filteredZones = displayedZones.filter(zone =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmMeeting = () => {
    if (!selected) {
      alert("Please select a meeting location");
      return;
    }
    
    const selectedZone = allZones.find(z => z.id === selected);
    if (!selectedZone) return;
    
    if (!date || !time) {
      alert("Please select both date and time");
      return;
    }
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Navigate back to chat with meeting details
    navigate(`/messages`, {
      state: {
        meetingDetails: {
          location: selectedZone.name,
          address: selectedZone.address,
          date: formattedDate,
          time: time,
          notes: additionalNotes,
          conversationId: conversationId || id
        }
      }
    });
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="h-screen w-full flex">
      {/* LEFT MAP */}
      <div className="flex-1 relative bg-linear-to-br from-[#d6c2a1] via-[#cbb59c] to-[#2f5f66]">
        {/* Search */}
        <div className="absolute top-6 left-6 right-6 max-w-md">
          <div className="flex items-center bg-white/80 backdrop-blur px-4 py-3 rounded-full shadow">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              placeholder="Search campus buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-3 bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>

        {/* Map Pins */}
        <div className="absolute top-1/3 left-1/3">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow text-xs">
              Main Library (Safe Zone)
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/3">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow text-xs">
              Student Union (Safe Zone)
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-3">
          {["+", "-", "◎"].map((c, i) => (
            <button
              key={i}
              className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-120 bg-white p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <h1 className="text-xl font-semibold">Set Meeting Point</h1>
          <p className="text-sm text-gray-500 mt-1">
            Coordinate a safe spot for your COD transaction with
            <span className="font-medium text-gray-800"> {userName}</span>
          </p>

          {/* Zones */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-400 font-semibold mb-2">
              <span>RECOMMENDED SAFE ZONES</span>
              <button 
                onClick={() => setShowAllZones(!showAllZones)}
                className="text-blue-600 cursor-pointer hover:text-blue-700"
              >
                {showAllZones ? "SHOW LESS" : "VIEW ALL"}
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {filteredZones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelected(zone.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selected === zone.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{zone.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{zone.address}</p>

                      {zone.tags && zone.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {zone.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {selected === zone.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Time */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 font-semibold mb-2">
              DATE & TIME
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center border rounded-xl px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  min={getCurrentDate()}
                  onChange={(e) => setDate(e.target.value)}
                  className="ml-2 text-sm outline-none w-full"
                />
              </div>

              <div className="flex items-center border rounded-xl px-3 py-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="ml-2 text-sm outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 font-semibold mb-2">
              ADDITIONAL NOTES
            </p>
            <textarea
              placeholder="e.g. I'll be wearing a red hoodie near the cafe entrance..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Info */}
          <div className="mt-6 bg-green-50 border border-green-200 p-3 rounded-xl flex gap-2">
            <Shield className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              Meeting at a Safe Zone ensures CCTV coverage and high foot traffic
              for a secure exchange.
            </p>
          </div>
        </div>

        {/* Button */}
        <div className="mt-6">
          <button 
            onClick={handleConfirmMeeting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg transition-colors font-medium"
          >
            Confirm Meeting Point
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            {userName?.toUpperCase()} WILL BE NOTIFIED TO CONFIRM
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetingPoint;