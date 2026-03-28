import React from "react";
import { 
  Eye, 
  Shield, 
  Mail, 
  CheckCircle,
  AlertCircle,
  ChevronDown,
  User
} from "lucide-react";

const ProfileVisibility = () => {
  return (
    <div className="max-w-xs">
      

      <div className="">
        {/* Visibility Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-semibold text-blue-800">Verified Campus Only</span>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm text-blue-700">
                Your profile visibility is currently set to <span className="font-semibold">Verified Campus Only</span>. 
                Only students with a confirmed EDU email can see your listings and contact you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVisibility;