import React from "react";
import { 
  Settings,
  Bell,
  Lock,
  HelpCircle,
  ChevronRight
} from "lucide-react";

const AccountSettingsAlt = () => {
  return (
    <div className="max-w-xs bg-[#0F172A] rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 ">
        <h2 className="text-md font-semibold text-[#94A3B8]">ACCOUNT SETTINGS</h2>
      </div>

      {/* Settings Items */}
      <div className="">
        {/* Notification Settings */}
        <button className="w-full px-6 py-4 flex flex-row gap-3 hover:bg-gray-800 transition-colors group">
        <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-[#94A3B8]" />
          </div>
          <span className="text-sm text-white">Notification Settings</span>
        </button>

        {/* Privacy & Data */}
        <button className="w-full px-6 py-4 flex flex-row gap-3 hover:bg-gray-800 transition-colors group">
             <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-[#94A3B8]" />
          </div>
          <span className="text-sm text-white">Privacy & Data</span>
         
        </button>

        {/* Help Center */}
        <button className="w-full px-6 py-4 flex flex-row gap-3 hover:bg-gray-800 transition-colors group">
            <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-[#94A3B8]" />
          </div>
          <span className="text-sm text-white">Help Center</span>
          
        </button>
      </div>
    </div>
  );
};

export default AccountSettingsAlt;