import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                    {/* Copyright and Description */}
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                        © 2024 CampusMart Inc. A secure marketplace for campus communities.
                    </div>

                    {/* Links */}
                    <div className="flex items-center space-x-3">
                        <Link to="/terms" className="hover:text-gray-900 transition-colors duration-200">
                            Terms
                        </Link>
                        <span>•</span>
                        <Link to="/privacy" className="hover:text-gray-900 transition-colors duration-200">
                            Privacy
                        </Link>
                        <span>•</span>
                        <Link to="/safety" className="hover:text-gray-900 transition-colors duration-200">
                            Safety Hub
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}