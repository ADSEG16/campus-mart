import { useState } from "react";
import { User, Lock, Bell, Shield, Smartphone, ChevronRight } from "lucide-react";
import Navbar from "../components/navbar";

export default function Settings() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [inAppAlerts, setInAppAlerts] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 space-y-2">
                        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Alex Johnson</div>
                                    <div className="text-sm text-gray-500">Verified Student</div>
                                </div>
                            </div>
                        </div>

                        <a href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="w-5 h-5 mr-3">📊</div>
                            <span>Dashboard</span>
                        </a>
                        <a href="/watchlist" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="w-5 h-5 mr-3">📦</div>
                            <span>My Listings</span>
                        </a>
                        <a href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="w-5 h-5 mr-3">🔄</div>
                            <span>Transaction History</span>
                        </a>
                        <a href="/messages" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="w-5 h-5 mr-3">💬</div>
                            <span>Messages</span>
                        </a>
                        <a href="/settings" className="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg">
                            <div className="w-5 h-5 mr-3">⚙️</div>
                            <span className="font-medium">Settings</span>
                        </a>

                        <div className="pt-4 mt-4 border-t border-gray-200">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                                    <span className="font-semibold text-sm text-gray-900">VERIFICATION STATUS</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    Your account is verified for the 2024 academic year at State University.
                                </p>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-green-700">VERIFIED STUDENT</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                        <p className="text-gray-600 mb-8">
                            Manage your profile, security, and notification preferences.
                        </p>

                        {/* Profile Information */}
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                            <div className="flex items-center mb-6">
                                <User className="w-6 h-6 text-blue-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="Alex Johnson"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        University Email
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue="alex.johnson@state.edu"
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        University email cannot be changed for verification purposes
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        University ID
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="STU-2024-9981"
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+1(555) 000-0000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                            <div className="flex items-center mb-6">
                                <Lock className="w-6 h-6 text-blue-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <div>
                                        <div className="font-medium text-gray-900">Change Password</div>
                                        <div className="text-sm text-gray-500">Last updated 3 months ago</div>
                                    </div>
                                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                                        Update Password
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Two-Factor Authentication (2FA)</div>
                                        <div className="text-sm text-gray-500">
                                            Secure your account with an extra layer of security via mobile code.
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                        <input
                                            type="checkbox"
                                            checked={twoFactor}
                                            onChange={(e) => setTwoFactor(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <div className="font-medium text-gray-900">Authorized Devices</div>
                                        <div className="text-sm text-gray-500">
                                            Manage the devices you're currently logged into.
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center">
                                        View All
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                            <div className="flex items-center mb-6">
                                <Bell className="w-6 h-6 text-blue-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Email Notifications</div>
                                        <div className="text-sm text-gray-500">
                                            Receive summaries of transaction activity and security alerts.
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                        <input
                                            type="checkbox"
                                            checked={emailNotifications}
                                            onChange={(e) => setEmailNotifications(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">In-App Alerts</div>
                                        <div className="text-sm text-gray-500">
                                            Get real-time push notifications for new messages and offers.
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                        <input
                                            type="checkbox"
                                            checked={inAppAlerts}
                                            onChange={(e) => setInAppAlerts(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Marketing & Promotions</div>
                                        <div className="text-sm text-gray-500">
                                            Stay updated on campus deals and marketplace events.
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                        <input
                                            type="checkbox"
                                            checked={marketing}
                                            onChange={(e) => setMarketing(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-1">Deactivate Account</h3>
                                    <p className="text-sm text-gray-600">
                                        Permanently remove your account and all associated data.
                                    </p>
                                </div>
                                <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                                    Discard
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                Discard
                            </button>
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}