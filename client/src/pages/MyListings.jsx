import Listing from "../components/listings/listing";
import ProfileSidebar from "../components/ProfileSidebar";
import SafetyCard from "../components/SafetyCard";
import Nav from "../components/nav";
import Footer from "../components/footer";

export default function MyListings() {
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
                    <Listing />
                </div>
            </div>
            <Footer />
        </div>
    )
}