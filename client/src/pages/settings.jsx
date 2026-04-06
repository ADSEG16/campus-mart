import { useEffect, useMemo, useState } from "react";
import { User, Lock, Bell, Shield, ChevronRight } from "lucide-react";
import Navbar from "../components/navbar";
import ProfileSidebar from "../components/ProfileSidebar";
import { getCurrentUser, updateCurrentUserProfile } from "../api/auth";
import { getStoredAuthToken } from "../api/http";
import { useToast } from "../context";

export default function Settings() {
    const hasDigit = (value) => /\d/.test(String(value || ""));
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingBio, setIsSavingBio] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const initialUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("currentUser") || "{}");
        } catch {
            return {};
        }
    }, []);

    const [currentUser, setCurrentUser] = useState(initialUser);

    useEffect(() => {
        const refreshCurrentUser = async () => {
            const token = getStoredAuthToken();
            if (!token) return;

            try {
                const response = await getCurrentUser({ token });
                const freshUser = response?.data;
                if (freshUser && typeof freshUser === "object") {
                    setCurrentUser(freshUser);
                    localStorage.setItem("currentUser", JSON.stringify(freshUser));
                }
            } catch {
                // Keep local values if fetch fails.
            }
        };

        refreshCurrentUser();
    }, []);

    const fullName = currentUser?.fullName || "Campus User";
    const [editableName, setEditableName] = useState(fullName);
    const [editableDepartment, setEditableDepartment] = useState(currentUser?.department || "");
    const [editableGraduationYear, setEditableGraduationYear] = useState(currentUser?.graduationYear || "");
    const [editableBio, setEditableBio] = useState(currentUser?.bio || "");
    const email = currentUser?.email || "Not provided";
    const isVerified = Boolean(
        currentUser?.isVerified ||
        currentUser?.emailVerified ||
        String(currentUser?.verificationStatus || "").toLowerCase() === "verified"
    );
    const initials = fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part?.[0] || "")
        .join("")
        .toUpperCase() || "CU";

    const preferencesKey = `settings:preferences:${currentUser?._id || "guest"}`;
    const savedPrefs = (() => {
        try {
            return JSON.parse(localStorage.getItem(preferencesKey) || "{}");
        } catch {
            return {};
        }
    })();

    const [emailNotifications, setEmailNotifications] = useState(savedPrefs.emailNotifications ?? true);
    const [inAppAlerts, setInAppAlerts] = useState(savedPrefs.inAppAlerts ?? true);
    const [marketing, setMarketing] = useState(savedPrefs.marketing ?? false);
    const [twoFactor, setTwoFactor] = useState(savedPrefs.twoFactor ?? true);
    const { showToast } = useToast();

    useEffect(() => {
        localStorage.setItem(
            preferencesKey,
            JSON.stringify({ emailNotifications, inAppAlerts, marketing, twoFactor })
        );
    }, [preferencesKey, emailNotifications, inAppAlerts, marketing, twoFactor]);

    useEffect(() => {
        setEditableName(currentUser?.fullName || "Campus User");
        setEditableDepartment(currentUser?.department || "");
        setEditableGraduationYear(currentUser?.graduationYear || "");
        setEditableBio(currentUser?.bio || "");
    }, [currentUser]);

    const handleSaveBio = async () => {
        const token = getStoredAuthToken();
        if (!token) {
            showToast("Please log in again.", "error");
            return;
        }

        try {
            setIsSavingBio(true);
            const response = await updateCurrentUserProfile({
                token,
                payload: { bio: editableBio.trim() },
            });

            const updatedUser = response?.data || {};
            setCurrentUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            setIsEditingBio(false);
            showToast("Bio updated successfully.", "success");
        } catch (error) {
            showToast(error.message || "Failed to update bio.", "error");
        } finally {
            setIsSavingBio(false);
        }
    };

    const handleSaveProfile = async () => {
        const nextName = editableName.trim();
        const nextDepartment = editableDepartment.trim();
        if (!nextName) {
            setSaveMessage("Name cannot be empty.");
            showToast("Name cannot be empty.", "error");
            return;
        }

        if (hasDigit(nextName) || hasDigit(nextDepartment)) {
            setSaveMessage("Name and department must contain text only (no numbers).");
            showToast("Name and department must contain text only (no numbers).", "error");
            return;
        }

        try {
            setIsSaving(true);
            setSaveMessage("");
            const token = getStoredAuthToken();
            if (!token) {
                setSaveMessage("Please log in again to update your name.");
                showToast("Please log in again.", "error");
                return;
            }

            showToast("Saving settings...", "info", 1200);

            const response = await updateCurrentUserProfile({
                token,
                payload: {
                    fullName: nextName,
                    department: nextDepartment,
                    graduationYear: editableGraduationYear,
                },
            });

            const updatedUser = response?.data || {};
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));

            setSaveMessage("Settings saved successfully.");
            showToast("Settings saved successfully.", "success");
            window.location.reload();
        } catch (error) {
            setSaveMessage(error.message || "Failed to update name.");
            showToast(error.message || "Failed to save settings.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar (desktop only) */}
                    <div className="hidden lg:block lg:w-72 lg:border-r lg:border-gray-200 lg:pr-6">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-4">
                            <ProfileSidebar />
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                                    <span className="font-semibold text-sm text-gray-900">VERIFICATION STATUS</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    {isVerified
                                        ? "Your university email has been verified for marketplace access."
                                        : "Complete verification to unlock full marketplace trust features."}
                                </p>
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${isVerified ? "bg-green-500" : "bg-yellow-500"}`}></div>
                                    <span className={`text-sm font-medium ${isVerified ? "text-green-700" : "text-yellow-700"}`}>
                                        {isVerified ? "VERIFIED STUDENT" : "VERIFICATION PENDING"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 lg:pl-6">
                        <div className="p-2 mb-6 text-center lg:hidden">
                            <div className="w-14 h-14 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-orange-600 font-semibold">{initials}</span>
                            </div>
                            <div className="font-semibold text-gray-900">{fullName}</div>
                            <div className="text-sm text-gray-500 break-all">{email}</div>
                        </div>

                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                            Manage your profile, security, and notification preferences.
                            </p>
                        </div>

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
                                        value={editableName}
                                        onChange={(event) => setEditableName(event.target.value)}
                                        pattern="^[^0-9]+$"
                                        title="Use text only. Numbers are not allowed."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        University Email
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue={email}
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
                                        value={editableDepartment}
                                        onChange={(event) => setEditableDepartment(event.target.value)}
                                        pattern="^[^0-9]+$"
                                        title="Use text only. Numbers are not allowed."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Department / major from your profile</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                                    <input
                                        type="text"
                                        value={editableGraduationYear}
                                        onChange={(event) => setEditableGraduationYear(event.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                                        {!isEditingBio ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingBio(true)}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                {currentUser?.bio?.trim() ? "Edit Bio" : "Add Bio"}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditableBio(currentUser?.bio || "");
                                                        setIsEditingBio(false);
                                                    }}
                                                    className="text-sm font-medium text-gray-600 hover:text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveBio}
                                                    disabled={isSavingBio}
                                                    className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                                >
                                                    {isSavingBio ? "Saving..." : "Save Bio"}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditingBio ? (
                                        <textarea
                                            value={editableBio}
                                            onChange={(event) => setEditableBio(event.target.value)}
                                            rows={3}
                                            maxLength={200}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="min-h-18 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
                                            {currentUser?.bio?.trim() || "Add bio"}
                                        </p>
                                    )}
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
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                                {isSaving ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                        {saveMessage && (
                            <p className="mt-3 text-sm text-gray-600 text-right">{saveMessage}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}