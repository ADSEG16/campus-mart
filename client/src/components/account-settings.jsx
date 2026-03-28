import React, { useState } from "react";
import { User, Lock, Bell } from "lucide-react";

const Toggle = ({ enabled, setEnabled }) => (
  <button
    onClick={() => setEnabled(!enabled)}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
      enabled ? "bg-blue-600" : "bg-gray-300"
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
        enabled ? "translate-x-6" : "translate-x-0"
      }`}
    />
  </button>
);

const AccountSettings = () => {
  const [form, setForm] = useState({
    name: "Alex Johnson",
    email: "ajohnson@st.ug.edu.gh",
    id: "11018234",
    phone: "",
  });

  const [twoFA, setTwoFA] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [appNotif, setAppNotif] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Changes saved successfully!");
    console.log(form, { twoFA, emailNotif, appNotif, marketing });
  };

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mb-6">
          Manage your profile, security, and notification preferences.
        </p>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg">Profile Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">University Email</label>
              <input
                value={form.email}
                disabled
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                University email cannot be changed for verification purposes.
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600">University ID</label>
              <input
                value={form.id}
                disabled
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone Number (Optional)</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+233 50 000 0000"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg">Security</h2>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-gray-500">Last updated 3 months ago</p>
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-full">
              Update Password
            </button>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div>
              <p className="font-medium">Two-Factor Authentication (2FA)</p>
              <p className="text-sm text-gray-500">
                Secure your account with an extra layer of security via mobile code.
              </p>
            </div>
            <Toggle enabled={twoFA} setEnabled={setTwoFA} />
          </div>

          <div className="flex justify-between items-center py-4">
            <div>
              <p className="font-medium">Authorized Devices</p>
              <p className="text-sm text-gray-500">
                Manage the devices you're currently logged into.
              </p>
            </div>
            <button className="text-blue-600 text-sm">View All</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg">Notifications</h2>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">
                Receive summaries of transaction activity and security alerts.
              </p>
            </div>
            <Toggle enabled={emailNotif} setEnabled={setEmailNotif} />
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <div>
              <p className="font-medium">In-App Alerts</p>
              <p className="text-sm text-gray-500">
                Get real-time push notifications for new messages and offers.
              </p>
            </div>
            <Toggle enabled={appNotif} setEnabled={setAppNotif} />
          </div>

          <div className="flex justify-between items-center py-4">
            <div>
              <p className="font-medium">Marketing & Promotions</p>
              <p className="text-sm text-gray-500">
                Stay updated on campus deals and marketplace events.
              </p>
            </div>
            <Toggle enabled={marketing} setEnabled={setMarketing} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <button className="text-red-500 font-medium">
            Deactivate Account
          </button>

          <div className="flex gap-3">
            <button className="px-5 py-2 border border-gray-200 rounded-xl">Discard</button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
