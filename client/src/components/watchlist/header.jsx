// import React from "react";
// import { User } from "lucide-react";

export default function Header() {
    return(
        <div>
            {/* Navigation Bar */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">MARKETPLACE</span>
                        <span className="text-sm text-gray-400">›</span>
                        <span className="text-sm font-medium text-blue-600">MY WATCHLIST</span>
                    </div>
                    {/* <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                    </div> */}
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
                </div>
            </div>
        </div>
    )
}