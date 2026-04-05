import LoginForm from "../components/login/form";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
export default function Login() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
                <LoginForm />
            </div>
            <Footer />
        </div>
    )
};