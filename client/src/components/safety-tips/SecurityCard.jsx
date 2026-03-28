import React from "react";
import { Phone, Shield, Clock } from "lucide-react";

const SecurityCard = () => {
  return (
    <div className="max-w-xs mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
        CAMPUS SECURITY
      </h3>

      {/* Emergency Line */}
      <div className="m-1 mb-4 border border-red-700 bg-red-100 rounded-2xl p-2 cursor-pointer">
        <div className="flex items-center justify-between gap-2 ">
          <p className="text-sm font-medium text-red-500">Emergency Line</p>
          <Phone className="w-4 h-4 text-red-700" />
        </div>
        <p className="text-base font-bold text-red-700">911</p>
      </div>

      {/* Campus Police */}
      <div className=" m-1 mb-4 border border-gray-100 rounded-2xl p-2 cursor-pointer">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-800">Campus Police</p>
          <Shield className="w-4 h-4 text-gray-800" />
        </div>
        <p className="text-base font-normal text-gray-400">(555)123-4567</p>
      </div>

      {/* Security Escort */}
      <div className="m-1 mb-4 border border-gray-100 rounded-2xl p-2 cursor-pointer">
        <div className="flex items-center justify-between gap-2 ">
          <p className="text-sm font-medium text-gray-800">Security Escort</p>
          <Clock className="w-4 h-4 text-gray-800" />
        </div>
        <p className="text-base font-normal text-gray-400">24/7 Available</p>
      </div>
    </div>
  );
};

export default SecurityCard;