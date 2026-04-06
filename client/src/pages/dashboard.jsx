import Nav from "../components/nav";
import Overview from "../components/dashboard/overview";
import Header from "../components/dashboard/header";
import Footer from "../components/footer";

export default function Dashboard() {
    return(
        <div className="min-h-screen flex flex-col">
            <Nav />
            <div className="flex-1 bg-white">
                <Header />
                <Overview />
            </div>
            <Footer />
        </div>
    )
}