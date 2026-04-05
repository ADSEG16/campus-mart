
import SignUpForm from "../components/signup/form";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function SignUpPage() {
    return(
        <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
            <SignUpForm />
        </div>
        <Footer />
        </div>
    )}