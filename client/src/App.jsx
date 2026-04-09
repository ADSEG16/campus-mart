import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ListingsProvider, ToastProvider, WatchlistProvider } from "./context";
import Login from "./pages/login";
import Signup from "./pages/signup";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Verification from "./components/signup/verification";
import ProfileSetup from "./components/signup/profileSetup";
import Dashboard from "./pages/dashboard";
import WatchList from "./pages/watchlist";
import Safety from "./pages/safety";
import Settings from "./pages/settings";
import Messages from "./pages/messages";
import AdminPage from "./pages/admin";
import ProductDetail from "./pages/product-detail";
import PublicProfile from "./pages/public-profile";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionDetails from "./pages/TransactionDetails";
import ReceiptPage from "./pages/receipt";
import PostNewItem from "./components/item-form";
import ListingPage from "./pages/MyListings";
import EditItem from "./components/EditItem";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import BackToTopButton from "./components/BackToTopButton";

export default function App() {
  return (
    <BrowserRouter>
      <ListingsProvider>
        <ToastProvider>
          <WatchlistProvider>
            <BackToTopButton />
            <Routes>
              <Route path="/" element={<Navigate to="/marketplace" replace />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/signup/verification" element={<Verification />} />
              <Route path="/signup/profileSetup" element={<ProfileSetup />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/marketplace" element={<Dashboard />} />
                <Route path="/dashboard" element={<ListingPage />} />
                <Route path="/watchlist" element={<WatchList />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/messages" element={<Messages />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/transactions/:id" element={<TransactionDetails />} />
                <Route path="/receipt/:id" element={<ReceiptPage />} />
                <Route path="/post-item" element={<PostNewItem />} />
                <Route path="/my-listings" element={<Navigate to="/dashboard" replace />} />
                <Route path="/edit-item/:id" element={<EditItem />} />
              </Route>
            </Routes>
          </WatchlistProvider>
        </ToastProvider>
      </ListingsProvider>
    </BrowserRouter>
  );
}
