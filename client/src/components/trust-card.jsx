import React from "react";
import { Shield, CheckCircle } from "lucide-react";

const TrustCard = () => {
  return (
    <div className="max-w-xs mt-6 bg-blue-100 rounded-2xl border border-blue-500 p-6 shadow-sm">
      {/* Header with Shield Icon */}
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-500">Trust Program</h3>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-base leading-relaxed">
        CampusMart is exclusive to verified students.You can always see if a buyer or seller has a verified university email badge.
      </p>
      
      <p className="text-gray-700 text-base leading-relaxed mt-2">
        <span className="inline-flex items-center gap-1 mx-1">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-600">verified university email badge</span>
        </span>
        .
      </p>
    </div>
  );
};

export default TrustCard;