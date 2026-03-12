import Nav from "../components/nav";
import ActiveChats from "../components/active-chats";
import Overview from "../components/dashboard/overview";
import QuickStats from "../components/quickstats";
import SafetyCard from "../components/SafetyCard";
import PostCard from "../components/PostCard";
import Header from "../components/dashboard/header";
import Footer from "../components/footer";

export default function Dashboard() {
    return(
        <div>
            <Nav />
            <div className="flex justify-between">
                {/* Left section - Left aligned */}
                <div className="flex flex-col grow">
                    <Header />
                    <Overview />
                    <PostCard />
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