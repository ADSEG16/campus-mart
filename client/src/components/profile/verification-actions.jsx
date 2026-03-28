import React from "react";
import { 
  Shield, 
  Mail, 
  Upload,
  ChevronRight
} from "lucide-react";

const VerificationActionsAlt = () => {
  return (
    <div className="max-w-xs bg-white rounded-xl border border-gray-200 ">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">VERIFICATION ACTIONS</h2>
      </div>

      {/* Action Items */}
      <div className="divide-y divide-gray-200">
        {/* Update Student ID */}
        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
          <span className="text-sm font-medium text-gray-900">Update Student ID</span>
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>

        {/* Change Email */}
        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
          <span className="text-sm font-medium text-gray-900">Change Email</span>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-green-600" />
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default VerificationActionsAlt;