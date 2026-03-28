import React from "react";
import { MapPin, ImageIcon, CreditCard, AlertOctagon } from "lucide-react";

const SafetyCards = () => {
  const cards = [
    {
      title: "Safe Meeting Zones",
      description:
        "Always meet in designated campus areas with CCTV coverage and high foot traffic. Avoid private residences or secluded spots.",
      icon: <MapPin size={24} />,
      extra: (
        <ul className="mt-2 text-gray-400 text-sm space-y-1">
          <li>• Student Union Lobby</li>
          <li>• Main Library Entrance</li>
        </ul>
      ),
    },
    {
      title: "Item Inspection",
      description:
        "Verify the item's condition before finalizing payment. For electronics, power them on and check basic functionality.",
      icon: <ImageIcon size={24} />,
      extra: (
        <div className="mt-2 bg-white/20 text-xs px-3 py-1 rounded-full inline-block">
          💡 EXPERT TIP: REQUEST MORE PHOTOS IN CHAT FIRST
        </div>
      ),
    },
    {
      title: "Payment Security",
      description:
        "Use Cash on Delivery (COD) or instant digital transfers (Zelle/Venmo) only once you have the item in hand.",
      icon: <CreditCard size={24} />,
      extra: (
        <div className="mt-2 flex gap-2">
          <span className="bg-white/20 text-xs px-3 py-1 rounded-full">COD RECOMMENDED</span>
          <span className="bg-white/20 text-xs px-3 py-1 rounded-full">NO PRE-PAYMENTS</span>
        </div>
      ),
    },
    {
      title: "Reporting",
      description:
        "Trust your instincts. If a user acts suspiciously or requests an unsafe location, flag them immediately via the chat menu.",
      icon: <AlertOctagon size={24} />,
      extra: (
        <div className="mt-2 text-xs text-blue-500 underline cursor-pointer">
          HOW TO REPORT A USER →
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-blue-100 text-blue-500 p-4 rounded-2xl border border-blue-500 shadow-md flex flex-col"
        >
          <div className="bg-white w-12 h-12 flex items-center justify-center rounded-full mb-4">
            {card.icon}
          </div>
          <h3 className="text-lg text-black font-bold mb-2">{card.title}</h3>
          <p className="text-gray-600">{card.description}</p>
          {card.extra}
        </div>
      ))}
    </div>
  );
};

export default SafetyCards;