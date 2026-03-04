import React from "react";
import { Shield } from "lucide-react";

const SafetyFirst = () => {
  return (
    <div className="bg-blue-100 p-4 border border-blue-600 mt-6 rounded-2xl max-w-xs">
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-blue-600">Safety First</h4>
      </div>
      
      <p className="text-sm text-gray-700 mb-3">
        Always meet in <strong>Safe Zones</strong> and use our in-app chat for all communications.
      </p>
      
      <div className=" text-blue-600 text-xs font-mono p-2 ">
       VIEW SAFETY GUIDE {'->'} 
      </div>
    </div>
  );
};

export default SafetyFirst;