import { useState } from "react";
import logo from "../assets/logo.svg";

export default function Navbar({ variant = "default" }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Product detail page has different navigation
    if (variant === "product") {
        return (
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="shrink-0">
                            <a href="/dashboard" className="flex items-center space-x-1">
                                <img 
                                    src={logo} 
                                    alt="CampusMart Logo" 
                                    className="h-10 w-10 sm:h-16 sm:w-16 object-contain mt-4" 
                                />
                                <p className="text-xl sm:text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
                                    Campus<span className="text-[#137FEC]">Mart</span>
                                </p>
                            </a>
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
                        <div className="flex items-center space-x-4">
                            <a 
                                href="/dashboard" 
                                className="hidden md:block text-gray-600 hover:text-gray-900 transition-colors font-medium"
                            >
                                Browse
                            </a>
                            <a 
                                href="/safety" 
                                className="hidden md:block text-gray-600 hover:text-gray-900 transition-colors font-medium"
                            >
                                Safety
                            </a>
                            <button className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                + Post Item
                            </button>
                            <a href="/settings" className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-semibold">👤</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    // Default navbar for other pages
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                   {/* Logo and Brand */}
                    <div className="shrink-0">
                        <a href="/dashboard" className="flex items-center space-x-1">
                            <img 
                                src={logo} 
                                alt="CampusMart Logo" 
                                className="h-10 w-10 sm:h-16 sm:w-16 object-contain mt-4" 
                            />
                            <p className="text-xl sm:text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
                                Campus<span className="text-[#137FEC]">Mart</span>
                            </p>
                        </a>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <a 
                            href="/dashboard" 
                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                        >
                            Marketplace
                        </a>
                        <a 
                            href="/watchlist" 
                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                        >
                            My Deals
                        </a>
                        <a href="/settings" className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold">👤</span>
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Mobile Navigation Menu */}
            <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
                <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">
                    <a 
                        href="/dashboard" 
                        className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                        onClick={toggleMenu}
                    >
                        Marketplace
                    </a>
                    <a 
                        href="/watchlist" 
                        className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                        onClick={toggleMenu}
                    >
                        My Deals
                    </a>
                    <a 
                        href="/settings" 
                        className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                        onClick={toggleMenu}
                    >
                        Settings
                    </a>
                </div>
            </div>
        </nav>
    );
}