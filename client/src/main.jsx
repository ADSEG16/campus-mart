import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ListingsProvider, WatchlistProvider } from "./context";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Verification from "./components/signup/verification";
import ProfileSetup from "./components/signup/profileSetup";
import Dashboard from "./pages/dashboard";
import WatchList from "./pages/watchlist";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionDetails from "./components/transactions/TransactionDetails";
import PostNewItem from "./components/item-form";
import ListingPage from "./pages/MyListings";
import EditItem from "./components/EditItem";
import Profile from "./pages/profile";
import ItemDetails from "./pages/ItemDetails";
import SafetyGuidelines from "./pages/SafetyGuidelines";
import Messages from "./pages/messages";
import MeetingPage from "./pages/MeetingPage";
import SettingsPage from "./pages/SettingsPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ListingsProvider>
      <WatchlistProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/verification" element={<Verification />} />
          <Route path="/signup/profileSetup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/transactions/:id" element={<TransactionDetails />} />
          <Route path="/post-item" element={<PostNewItem />} />
          <Route path="/my-listings" element={<ListingPage />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/safety" element={<SafetyGuidelines />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/meetings/:id" element={<MeetingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </WatchlistProvider>
    </ListingsProvider>
  </BrowserRouter>
);