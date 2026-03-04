import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Verification from "./components/signup/verification";
import ProfileSetup from "./components/signup/profileSetup";
import Dashboard from "./pages/dashboard";
import WatchList from "./pages/watchlist";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
       <Route path="/" element={<Login />} />
       <Route path="/signup" element={<Signup />} />
        <Route path="/signup/verification" element={<Verification />} />
        <Route path="/signup/profileSetup" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/watchlist" element={<WatchList />} />
    </Routes>
  </BrowserRouter>
);