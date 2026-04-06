import LoginForm from "../components/login/form";
import Footer from "../components/footer";
export default function Login() {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center">
                <LoginForm />
            </div>
            <Footer />
        </div>
    )
};