
import SignUpForm from "../components/signup/form";
import Footer from "../components/footer";

export default function SignUpPage() {
    return(
        <div className="min-h-screen flex flex-col">
        <div className="flex-1">
            <SignUpForm />
        </div>
        <Footer />
        </div>
    )}