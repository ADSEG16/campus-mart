import Nav from "../components/nav";
import Footer from "../components/footer";
import Header from "../components/safety-tips/header";
import TipCard from "../components/safety-tips/TipCard";
import FAQ from "../components/safety-tips/FAQ";
import AccountSettingsAlt from "../components/profile/account-settings";
import TrustCard from "../components/trust-card";
import SecurityCard from "../components/safety-tips/SecurityCard";

export default function SafetyGuidelines() {
    return(
        <div>
            <Nav />
            <div className="flex flex-row">
                <div className="flex flex-col w-3/4">
                    <Header />
                    <TipCard/>
                    <FAQ />
                </div>
                <div className="mt-12 w-1/4">
                    <SecurityCard />
                    <AccountSettingsAlt/>
                    <TrustCard />
                </div>
            </div>
            <Footer />
        </div>
    )
}