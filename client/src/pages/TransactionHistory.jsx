import Nav from "../components/nav";
import ProfileSidebar from "../components/ProfileSidebar";
import HistoryList from "../components/transactions/history";
import SafetyCard from "../components/SafetyCard";
import Footer from "../components/footer";


export default function TransactionHistory() {
    return(
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
                    <HistoryList />
                </div>
            </div>
            <Footer />
        </div>
            )}