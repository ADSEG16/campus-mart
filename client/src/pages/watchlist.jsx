import MyWatchlist from "../components/watchlist/MySaves";
import Nav from "../components/nav";
import Header from "../components/watchlist/header";
import Footer from "../components/footer";


export default function WatchListPage() {
    return(
        <div className="min-h-screen flex flex-col">
            <Nav />
            <div className="flex flex-col flex-1 max-w-[1500px] mx-auto w-full px-4 sm:px-6 lg:px-6 py-4 sm:py-6">
                <div className="flex flex-col grow">
                    <Header />
                    <MyWatchlist />
                </div>
            </div>
            <Footer />
        </div>
    )
}