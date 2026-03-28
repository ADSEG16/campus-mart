import Nav from "../components/nav";
import Footer from "../components/footer";
import ProfileInfo from "../components/profile/info";
import VerificationActions from "../components/profile/verification-actions";
import TrustCard from "../components/profile/TrustCard";
import AccountSettingsAlt from "../components/profile/account-settings";


export default function UserProfile() {
  return (
    <div>
        <Nav />
            <div className="flex flex-row gap-11 m-8">
                <ProfileInfo />
                <div className="flex flex-col gap-6">
                    <VerificationActions />
                    <AccountSettingsAlt />
                    <TrustCard/>
                </div>
            </div>
        <Footer />
    </div>
  );
}

