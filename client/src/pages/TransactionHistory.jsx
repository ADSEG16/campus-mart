import Nav from "../components/nav";
import ProfileSidebar from "../components/ProfileSidebar";
import HistoryList from "../components/transactions/history";
import SafetyCard from "../components/SafetyCard";
import Footer from "../components/footer";


export default function TransactionHistory() {
    return(
        <div className="min-h-screen flex flex-col">
            <Nav />
            <div className="flex flex-col lg:flex-row flex-1 max-w-[1500px] mx-auto w-full px-4 sm:px-6 lg:px-6 py-4 sm:py-6">
                <div className="hidden lg:block lg:w-72 lg:border-r lg:border-gray-200 lg:pr-6">
                    <div className="lg:sticky lg:top-24 flex flex-col gap-4">
                        <ProfileSidebar/>
                        <div className="w-full">
                            <SafetyCard />
                        </div>
                    </div>
                </div>
                <div className="flex-1 mt-2 px-0 lg:pl-6">
                    <HistoryList />
                </div>
            </div>
            <Footer />
        </div>
            )}