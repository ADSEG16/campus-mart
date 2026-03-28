import Nav from "../components/nav";
import Footer from "../components/footer";
import MeetingPoint from "../components/chat/meeting-point/set-meeting";

export default function MeetingPage() {
    return (
        <div>
            <Nav />
            <div>
                <MeetingPoint />
            </div>
            <Footer />
        </div>
    );
}