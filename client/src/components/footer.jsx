import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    useEffect(() => {
        if (!isTermsOpen) return;

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsTermsOpen(false);
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isTermsOpen]);

    return (
        <>
        <footer className="bg-white">
            <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4 lg:px-4">
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                    {/* Copyright and Description */}
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                        © 2024 CampusMart Inc. A secure marketplace for campus communities.
                    </div>

                    {/* Links */}
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsTermsOpen(true)}
                            className="hover:text-gray-900 transition-colors duration-200"
                        >
                            Terms &amp; Conditions
                        </button>
                        <span>•</span>
                        <Link to="/safety" className="hover:text-gray-900 transition-colors duration-200">
                            Safety Hub
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
        {isTermsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                    type="button"
                    aria-label="Close terms and conditions"
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setIsTermsOpen(false)}
                />

                <div className="relative z-10 w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <h3 className="text-base font-semibold text-gray-900">Terms &amp; Conditions</h3>
                        <button
                            type="button"
                            onClick={() => setIsTermsOpen(false)}
                            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                            Close
                        </button>
                    </div>

                    <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-4 text-sm text-gray-700">
                        <p>
                            By using CampusMart, you agree to use the platform for lawful campus marketplace
                            activities only. You are responsible for the accuracy of listings, communication,
                            and transactions made through your account.
                        </p>
                        <p>
                            For safety, users should meet at verified campus locations when possible. CampusMart
                            may suspend accounts or remove listings that violate community rules, including fraud,
                            abuse, misleading listings, or unsafe behavior.
                        </p>
                        <p>
                            Privacy: CampusMart collects account, listing, and transaction data required to run
                            the marketplace, improve trust and moderation, and provide user support. We do not
                            sell your personal data. Information may be shared only when required for security,
                            legal compliance, or platform operations.
                        </p>
                        <p>
                            By continuing to use the platform, you consent to these terms and privacy conditions.
                            If you disagree, you should stop using CampusMart and deactivate your account.
                        </p>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}