import { useEffect, useMemo, useRef, useState } from "react";
import { User, Lock, Bell, Shield, ChevronRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import ProfileSidebar from "../components/ProfileSidebar";
import { getCurrentUser, updateCurrentUserProfile } from "../api/auth";
import { getStoredAuthToken } from "../api/http";
import { useToast } from "../context";
import {
    getCurrentUserSettings,
    updateCurrentUserSettings,
    getTrustAnalytics,
    deleteCurrentUserAccount,
    replaceCurrentUserAvatar,
    uploadCurrentUserAvatar,
} from "../api/user";

const DEFAULT_SETTINGS = {
    emailNotifications: true,
    inAppAlerts: true,
    marketing: false,
    twoFactor: true,
};

export default function Settings() {
    const hasDigit = (value) => /\d/.test(String(value || ""));
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingBio, setIsSavingBio] = useState(false);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isLoadingTrust, setIsLoadingTrust] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [deactivateConfirmation, setDeactivateConfirmation] = useState("");
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const navigate = useNavigate();
    const avatarInputRef = useRef(null);

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
                setIsLoadingTrust(true);
                const [response, settings, trustAnalytics] = await Promise.all([
                    getCurrentUser({ token }),
                    getCurrentUserSettings({ token }),
                    getTrustAnalytics({ token, limit: 12 }),
                ]);
                const freshUser = response?.data;
                if (freshUser && typeof freshUser === "object") {
                    setCurrentUser(freshUser);
                    localStorage.setItem("currentUser", JSON.stringify(freshUser));
                }

                setEmailNotifications(Boolean(settings?.emailNotifications));
                setInAppAlerts(Boolean(settings?.inAppAlerts));
                setMarketing(Boolean(settings?.marketing));
                setTwoFactor(Boolean(settings?.twoFactor));

                setCurrentTrustScore(Number(trustAnalytics?.currentTrustScore ?? freshUser?.trustScore ?? 50));
                setTrustTimeline(Array.isArray(trustAnalytics?.timeline) ? trustAnalytics.timeline : []);
            } catch {
                // Keep local values if fetch fails.
            } finally {
                setIsLoadingTrust(false);
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
    const profileImageUrl = String(currentUser?.profileImageUrl || "").trim();
    const isVerified = Boolean(
        currentUser?.isVerified ||
        String(currentUser?.verificationStatus || "").toLowerCase() === "verified"
    );
    const initials = fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part?.[0] || "")
        .join("")
        .toUpperCase() || "CU";

    const [emailNotifications, setEmailNotifications] = useState(DEFAULT_SETTINGS.emailNotifications);
    const [inAppAlerts, setInAppAlerts] = useState(DEFAULT_SETTINGS.inAppAlerts);
    const [marketing, setMarketing] = useState(DEFAULT_SETTINGS.marketing);
    const [twoFactor, setTwoFactor] = useState(DEFAULT_SETTINGS.twoFactor);
    const [trustTimeline, setTrustTimeline] = useState([]);
    const [currentTrustScore, setCurrentTrustScore] = useState(currentUser?.trustScore || 50);
    const { showToast } = useToast();

    const handleAvatarButtonClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        const token = getStoredAuthToken();
        if (!token) {
            showToast("Please log in again.", "error");
            return;
        }

        try {
            setIsSavingAvatar(true);
            const avatarResponse = profileImageUrl
                ? await replaceCurrentUserAvatar({ token, file })
                : await uploadCurrentUserAvatar({ token, file });

            const updatedUser = {
                ...currentUser,
                profileImageUrl: avatarResponse?.profileImageUrl || avatarResponse?.data?.profileImageUrl || currentUser?.profileImageUrl || null,
            };

            setCurrentUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            showToast(profileImageUrl ? "Profile photo updated." : "Profile photo uploaded.", "success");
        } catch (error) {
            showToast(error.message || "Failed to upload profile photo.", "error");
        } finally {
            setIsSavingAvatar(false);
        }
    };

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

        if (hasDigit(nextName)) {
            setSaveMessage("Name must contain text only (no numbers).");
            showToast("Name must contain text only (no numbers).", "error");
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

            const [response] = await Promise.all([
                updateCurrentUserProfile({
                    token,
                    payload: {
                        fullName: nextName,
                        department: nextDepartment,
                        graduationYear: editableGraduationYear,
                    },
                }),
                updateCurrentUserSettings({
                    token,
                    payload: {
                        emailNotifications,
                        inAppAlerts,
                        marketing,
                        twoFactor,
                    },
                }),
            ]);

            const updatedUser = response?.data || {};
            setCurrentUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));

            setIsLoadingTrust(true);
            const trustAnalytics = await getTrustAnalytics({ token, limit: 12 }).catch(() => null);
            if (trustAnalytics) {
                setCurrentTrustScore(Number(trustAnalytics?.currentTrustScore ?? updatedUser?.trustScore ?? 50));
                setTrustTimeline(Array.isArray(trustAnalytics?.timeline) ? trustAnalytics.timeline : []);
            }

            setSaveMessage("Settings saved successfully.");
            showToast("Settings saved successfully.", "success");
        } catch (error) {
            setSaveMessage(error.message || "Failed to update name.");
            showToast(error.message || "Failed to save settings.", "error");
        } finally {
            setIsLoadingTrust(false);
            setIsSaving(false);
        }
    };

    const handleDeactivateAccount = async () => {
        const token = getStoredAuthToken();
        if (!token) {
            showToast("Please log in again.", "error");
            return;
        }

        if (deactivateConfirmation.trim().toUpperCase() !== "DEACTIVATE") {
            showToast("Type DEACTIVATE to confirm account removal.", "error");
            return;
        }

        try {
            setIsDeactivating(true);
            await deleteCurrentUserAccount({ token, confirmation: deactivateConfirmation.trim() });
            localStorage.removeItem("authToken");
            localStorage.removeItem("currentUser");
            showToast("Account deactivated successfully.", "success");
            navigate("/login");
        } catch (error) {
            showToast(error.message || "Failed to deactivate account.", "error");
        } finally {
            setIsDeactivating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar variant="settings" />
            
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-4 py-8">
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
                                        ? "Your student verification has been approved for trusted marketplace access."
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
                            <div className="w-14 h-14 overflow-hidden bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-orange-50">
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl}
                                        alt={`${fullName} profile`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-orange-600 font-semibold">{initials}</span>
                                )}
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

                            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-white shadow-sm">
                                        {profileImageUrl ? (
                                            <img
                                                src={profileImageUrl}
                                                alt={`${fullName} profile`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-base font-semibold text-white">{initials}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Profile photo</p>
                                        <p className="text-sm text-gray-500">
                                            {profileImageUrl
                                                ? "Replace your current avatar or upload a new one."
                                                : "Upload a profile photo. If you skip this, we’ll show your initials."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAvatarButtonClick}
                                        disabled={isSavingAvatar}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSavingAvatar ? "Uploading..." : profileImageUrl ? "Replace Photo" : "Upload Photo"}
                                    </button>
                                </div>
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

                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                            <div className="flex items-center mb-4">
                                <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Trust Analytics</h2>
                            </div>

                            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Current Trust Score</p>
                                <p className="mt-1 text-2xl font-bold text-blue-900">{Number(currentTrustScore || 0)} / 100</p>
                            </div>

                            {isLoadingTrust ? (
                                <p className="text-sm text-gray-500">Loading trust history...</p>
                            ) : trustTimeline.length > 0 ? (
                                <div className="space-y-3">
                                    {trustTimeline.map((event) => {
                                        const delta = Number(event?.delta || 0);
                                        const isPositive = delta > 0;
                                        const isNegative = delta < 0;
                                        const deltaLabel = `${isPositive ? "+" : ""}${delta}`;

                                        return (
                                            <div
                                                key={event.id}
                                                className="flex items-start justify-between rounded-lg border border-gray-200 px-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{event.reason || "Trust score updated"}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {event.timestamp ? new Date(event.timestamp).toLocaleString() : "Unknown time"}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            isPositive
                                                                ? "bg-green-100 text-green-700"
                                                                : isNegative
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {deltaLabel}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {event.previousScore ?? "-"} to {event.trustScore ?? "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No trust score changes recorded yet.</p>
                            )}
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
                                <button
                                    type="button"
                                    onClick={() => setIsDeactivateModalOpen(true)}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                                >
                                    Deactivate
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

            {isDeactivateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Close deactivate account dialog"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            if (!isDeactivating) {
                                setIsDeactivateModalOpen(false);
                            }
                        }}
                    />

                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-red-700">Confirm Account Deactivation</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            This action permanently deletes your account and removes your listings. Type DEACTIVATE to continue.
                        </p>

                        <input
                            type="text"
                            value={deactivateConfirmation}
                            onChange={(event) => setDeactivateConfirmation(event.target.value)}
                            placeholder="Type DEACTIVATE"
                            className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                        />

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsDeactivateModalOpen(false)}
                                disabled={isDeactivating}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeactivateAccount}
                                disabled={isDeactivating}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {isDeactivating ? "Deactivating..." : "Confirm Deactivate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}