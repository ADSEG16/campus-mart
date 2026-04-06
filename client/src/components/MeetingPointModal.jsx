import { useState } from "react";
import { X, MapPin, Building, Calendar, Clock, Shield, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { getStoredAuthToken } from "../api/http";
import { updateOrderStatus } from "../api/orders";

export default function MeetingPointModal({ onClose, orderId, counterpartName, onScheduled }) {
    const [selectedZone, setSelectedZone] = useState("library");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const safeZones = [
        {
            id: "library",
            name: "Main Library Entrance",
            address: "345 University Drive, Campus Center",
            features: ["CCTV ACTIVE", "POPULAR SPOT"]
        },
        {
            id: "union",
            name: "Student Union Hub",
            address: "East Wing, Ground Floor Lounge",
            features: []
        }
    ];

    const selectedZoneData = safeZones.find((zone) => zone.id === selectedZone);

    const handleConfirm = async () => {
        if (!orderId) {
            setErrorMessage("No order selected for scheduling.");
            return;
        }

        if (!date || !time) {
            setErrorMessage("Please select a valid date and time.");
            return;
        }

        const token = getStoredAuthToken();
        if (!token) {
            setErrorMessage("Please login again.");
            return;
        }

        const scheduledFor = new Date(`${date}T${time}`);
        if (Number.isNaN(scheduledFor.getTime())) {
            setErrorMessage("Invalid meeting date/time.");
            return;
        }

        const baseLocation = selectedZoneData
            ? `${selectedZoneData.name} - ${selectedZoneData.address}`
            : "Custom campus location";
        const meetupLocation = notes.trim() ? `${baseLocation}. ${notes.trim()}` : baseLocation;

        try {
            setIsSaving(true);
            setErrorMessage("");

            await updateOrderStatus({
                token,
                orderId,
                payload: {
                    nextStatus: "meetup_scheduled",
                    meetupType: selectedZone === "library" || selectedZone === "union" ? "verified" : "custom",
                    meetupLocation,
                    meetupScheduledFor: scheduledFor.toISOString(),
                },
            });

            if (onScheduled) {
                onScheduled();
            } else {
                onClose();
            }
        } catch (error) {
            setErrorMessage(error.message || "Failed to schedule meeting");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 text-sm">✓</span>
                        </div>
                        <span className="text-sm font-medium text-green-700">SECURE TRANSACTION</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 p-6">
                    {/* Map Section */}
                    <div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search campus buildings..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                            />
                        </div>

                        {/* Interactive Map Placeholder */}
                        <div className="bg-linear-to-br from-teal-400 to-teal-600 rounded-xl h-96 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Map pins */}
                                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="bg-white px-3 py-1 rounded-lg shadow-lg mt-2 text-xs font-medium whitespace-nowrap">
                                        Main Library (Safe Zone)
                                    </div>
                                </div>

                                <div className="absolute bottom-1/3 right-1/3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="bg-white px-3 py-1 rounded-lg shadow-lg mt-2 text-xs font-medium whitespace-nowrap">
                                        Student Union (Safe Zone)
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-4 left-4 text-white text-xs opacity-75">
                                    CAMPUS HUBS
                                </div>
                                <div className="absolute bottom-4 left-4 text-white text-xs opacity-75">
                                    DINING HALLS
                                </div>
                            </div>

                            {/* Map Controls */}
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Plus className="w-5 h-5 text-gray-700" />
                                </button>
                                <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <Minus className="w-5 h-5 text-gray-700" />
                                </button>
                                <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <MapPin className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-gray-500 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Map Data Updated: Just Now
                            <Link to="/safety" className="ml-auto text-blue-600 hover:text-blue-700">Campus Safety Policy</Link>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Meeting Point</h2>
                        <p className="text-gray-600 mb-6">
                            Coordinate a safe spot for your COD transaction with <span className="font-semibold">{counterpartName || "Campus User"}</span>
                        </p>

                        {errorMessage && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        {/* Safe Zones */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-700">RECOMMENDED SAFE ZONES</h3>
                                <Link to="/safety" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    VIEW ALL
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {safeZones.map((zone) => (
                                    <button
                                        key={zone.id}
                                        onClick={() => setSelectedZone(zone.id)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                            selectedZone === zone.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                                selectedZone === zone.id ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}>
                                                <Building className={`w-5 h-5 ${
                                                    selectedZone === zone.id ? 'text-white' : 'text-gray-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 mb-1">{zone.name}</div>
                                                <div className="text-sm text-gray-600 mb-2">{zone.address}</div>
                                                {zone.features.length > 0 && (
                                                    <div className="flex gap-2">
                                                        {zone.features.map((feature, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded"
                                                            >
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedZone === zone.id && (
                                                <div className="text-blue-600">✓</div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">DATE & TIME</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">SELECT DATE</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">SELECT TIME</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ADDITIONAL NOTES
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. I'll be wearing a red hoodie near the cafe entrance..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Safety Notice */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                                <p className="text-sm text-green-900">
                                    Meeting at a Safe Zone ensures CCTV coverage and high foot traffic for a secure exchange.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={handleConfirm}
                            disabled={isSaving}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors mb-3 flex items-center justify-center"
                        >
                            Confirm Meeting Point
                            <span className="ml-2">→</span>
                        </button>

                        <div className="text-center text-sm text-gray-500">
                            ALEX WILL BE NOTIFIED TO CONFIRM
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}