import React from "react";
import { Sparkles } from "lucide-react";

const DescriptionCard = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">

      <h2 className="text-2xl font-bold mb-4">
        Item Description
      </h2>

      <p className="text-gray-700 mb-4">
        {item.description}
      </p>

      <h3 className="font-semibold mb-2">Highlights:</h3>

      <ul className="space-y-2">
        {item.highlights?.map((highlight, index) => (
          <li key={index} className="flex gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default DescriptionCard;