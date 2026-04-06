import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";

export default function Navbar({ variant = "default" }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const isSettingsVariant = variant === "settings";

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        setIsMenuOpen(false);
        navigate("/login");
    };

    // Product detail page has different navigation
    if (variant === "product") {
        return (
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="shrink-0">
                            <BrandLogo to="/marketplace" />
                        </div>

                        {/* Search Bar - Hidden on mobile */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <input
                                type="text"
                                placeholder="Search for books, dorm gear, electronics..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Right side navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link 
                                to="/marketplace" 
                                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                            >
                                Browse
                            </Link>
                            <Link 
                                to="/safety" 
                                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                            >
                                Safety
                            </Link>
                            <Link to="/post-item" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                + Post Item
                            </Link>
                        </div>

                        <button
                            onClick={toggleMenu}
                            className="md:hidden p-0 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50">
                        <button
                            type="button"
                            aria-label="Close navigation drawer"
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-0 h-full w-[82vw] max-w-sm bg-white shadow-2xl p-5 overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Menu</span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-0 text-gray-700"
                                    aria-label="Close navigation drawer"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                    Dashboard
                                </Link>
                                <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                    Marketplace
                                </Link>
                                <Link to="/watchlist" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                    Watchlist
                                </Link>
                                <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                    Messages
                                </Link>
                                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                    Settings
                                </Link>
                                <Link to="/safety" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                    Safety
                                </Link>
                                <Link to="/post-item" onClick={() => setIsMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium mt-4">
                                    Post Item
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        );
    }

    // Default navbar for other pages
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4">
                <div className="flex items-center justify-between h-16">
                   {/* Logo and Brand */}
                    <div className="shrink-0">
                        <BrandLogo to="/dashboard" />
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                            <Link 
                                to="/marketplace" 
                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                        >
                            Marketplace
                        </Link>
                        <Link 
                            to="/watchlist" 
                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                        >
                            Watchlist
                        </Link>
                        {isSettingsVariant && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
                            >
                                Logout
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-0 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <button
                        type="button"
                        aria-label="Close navigation drawer"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-0 h-full w-[82vw] max-w-sm bg-white shadow-2xl p-5 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Menu</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-0 text-gray-700"
                                aria-label="Close navigation drawer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                Dashboard
                            </Link>
                            <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                Messages
                            </Link>
                            <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                Settings
                            </Link>
                            <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                Marketplace
                            </Link>
                            <Link to="/watchlist" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                Watchlist
                            </Link>
                            <Link to="/safety" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                                Safety
                            </Link>
                            <Link to="/post-item" onClick={() => setIsMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium mt-4">
                                Post Item
                            </Link>
                            {isSettingsVariant && (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full text-center px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-medium"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}