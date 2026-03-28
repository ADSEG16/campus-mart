import Nav from "../components/nav";
import Footer from "../components/footer";
import AccountSettings from "../components/account-settings";
import ProfileSidebar from "../components/ProfileSidebar";
import SafetyCard from "../components/SafetyCard";

export default function SettingsPage() {
    return (
        <div>
            <Nav />
            <div className="flex flex-row">
                <div className="flex flex-col m-8">
                    <ProfileSidebar/>
                    <div className="w-64">
                        <SafetyCard />
                    </div>
                </div>
                <div className="flex-1 mt-2">
                    <AccountSettings />
                </div>
            </div>
            <Footer />
        </div>
            )}