import { MapPin, FileText, CreditCard, AlertCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";

export default function Safety() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Safety Tips & Guidelines
                            </h1>
                            <p className="text-gray-600">
                                Our community thrives on trust. Follow these simple steps to ensure every transaction on CampusMart is secure and successful.
                            </p>
                        </div>

                        {/* Safety Cards Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Safe Meeting Zones */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Safe Meeting Zones
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Always meet in designated campus areas with CCTV coverage and high foot traffic. Avoid private residences or secluded spots.
                                </p>
                               
                            </div>

                            {/* Item Inspection */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Item Inspection
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Verify the item's condition before finalizing payment. For electronics, power them on and check basic functionality.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">💡 EXPERT TIP:</span> REQUEST MORE PHOTOS VIA OTHER CHANNELS
                                    </p>
                                </div>
                            </div>

                            {/* Payment Security */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Payment Security
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Use Cash on Delivery (COD) or instant digital transfers (Momo) only once you have the item in hand.
                                </p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                                        COD RECOMMENDED
                                    </span>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-medium">
                                        NO PRE-PAYMENTS
                                    </span>
                                </div>
                            </div>

                            {/* Reporting */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <AlertCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Reporting
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Trust your instincts. If a user acts suspiciously or requests an unsafe location, flag them immediately via the chat menu.
                                </p>
                                <Link to="/messages" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                                    REPORT A USER →
                                </Link>
                            </div>
                        </div>

                        {/* Safe Zone Badge Section */}
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <div className="w-full max-w-md mx-auto mb-6">
                                <div className="bg-linear-to-br from-teal-500 to-teal-700 rounded-lg p-8 text-white">
                                    <div className="text-sm font-medium mb-2">CAMPUS</div>
                                    <div className="flex items-center justify-center space-x-4 mb-4">
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    </div>
                                    <div className="text-3xl font-bold">SAFE ZONE</div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Look for the Safe Zone Badge
                            </h3>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                When chatting, look for the "Safe Zone Verified" tag. These are campus landmarks pre-approved for trading by our safety team.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 space-y-6">
                        {/* Campus Security */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                SECURITY
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Emergency Line</div>
                                        <div className="text-xl font-bold text-red-600">911</div>
                                    </div>
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <span className="text-red-600">📞</span>
                                    </div>
                                </div>
                                
                                <div className="p-3 border border-gray-200 rounded-lg">
                                    <div className="text-sm font-medium text-gray-700">Campus Police</div>
                                    <div className="text-lg font-semibold text-gray-900">911</div>
                                </div>
                                
                                <div className="p-3 border border-gray-200 rounded-lg">
                                    <div className="text-sm font-medium text-gray-700">Security Escort</div>
                                    <div className="text-lg font-semibold text-gray-900">24/7 Available</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Resources */}
                        <div className="bg-gray-900 rounded-xl p-6 shadow-sm text-white">
                            <h3 className="text-lg font-semibold mb-4">QUICK RESOURCES</h3>
                            <div className="space-y-3">
                                <Link to="/safety" className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                    <FileText className="w-5 h-5 mr-3" />
                                    <span>Full Safety Manual</span>
                                </Link>
                                <Link to="/signup/verification" className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                    <Shield className="w-5 h-5 mr-3" />
                                    <span>Verify My Account</span>
                                </Link>
                                <Link to="/messages" className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                    <AlertCircle className="w-5 h-5 mr-3" />
                                    <span>Contact Support</span>
                                </Link>
                            </div>
                        </div>

                        {/* Trust Program */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center mb-3">
                                <Shield className="w-6 h-6 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Trust Program</h3>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">
                                CampusMart is exclusive to verified students. You can always ask if a buyer or seller has a verified university email badge.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}