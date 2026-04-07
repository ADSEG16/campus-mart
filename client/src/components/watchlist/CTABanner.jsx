import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CTABanner() {
    const navigate = useNavigate();
    const handleBackToMarketplace = () => {
        navigate("/marketplace");
    }
    return(
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4 py-4 sm:py-6">
            {/* Marketplace Banner */}
            <div className="mt-8 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Want to see more deals?
                        </h3>
                        <p className="text-gray-600">
                            Browse a list of all the offers on our active offers page.
                        </p>
                    </div>
                    <button onClick={handleBackToMarketplace} className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-2xl hover:bg-blue-200 transition-colors text-sm font-medium">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Marketplace</span>
                    </button>
                </div>
            </div>
        </div>
    )
}