import MyWatchlist from "../components/watchlist/MySaves";
import Nav from "../components/nav";
import Header from "../components/watchlist/header";
import CTABanner from "../components/watchlist/CTABanner";
import QuickStats from "../components/quickstats";
import SafetyCard from "../components/SafetyCard";
import ActiveChats from "../components/active-chats";
import Footer from "../components/footer";


export default function WatchListPage() {
    return(
        <div>
            <Nav />
            <div className="flex justify-between">
                <div className="flex flex-col grow">
                    <Header />
                    <MyWatchlist />
                    <CTABanner />
                </div>
                {/* Right section - Always on the right */}
                <div className="flex flex-col w-1/4 shrink-0">
                    <ActiveChats />
                    <QuickStats />
                    <SafetyCard />
                </div>
            </div>
            <Footer />
        </div>
    )
}