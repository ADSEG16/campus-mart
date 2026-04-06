import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getPublicUserProfile } from "../api/user";
import { listSellerReviews } from "../api/orders";

const getInitials = (fullName) =>
  String(fullName || "Campus User")
    .split(" ")
    .slice(0, 2)
    .map((part) => part?.[0] || "")
    .join("")
    .toUpperCase() || "CU";

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, ratingCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [publicProfile, sellerReviews] = await Promise.all([
          getPublicUserProfile({ userId }),
          listSellerReviews({ sellerId: userId }).catch(() => ({ reviews: [], summary: {} })),
        ]);

        if (!mounted) return;

        setProfile(publicProfile);
        setReviews(sellerReviews?.reviews || []);
        setSummary(sellerReviews?.summary || { averageRating: 0, ratingCount: 0 });
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error.message || "Failed to load seller profile");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const initials = useMemo(() => getInitials(profile?.fullName), [profile?.fullName]);
  const joinedLabel = useMemo(() => {
    if (!profile?.createdAt) return "";
    const date = new Date(profile.createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }, [profile?.createdAt]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="product" />
        <div className="mx-auto max-w-[1400px] px-3 py-8 sm:px-4 lg:px-4">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
            Loading profile...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMessage || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="product" />
        <div className="mx-auto max-w-[1400px] px-3 py-8 sm:px-4 lg:px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            {errorMessage || "Seller profile not found"}
          </div>
          <div className="mt-4 text-center">
            <Link to="/marketplace" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Back to Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="product" />
      <div className="mx-auto max-w-[1400px] px-3 py-8 sm:px-4 lg:px-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
              {initials}
            </div>
            <h1 className="text-center text-xl font-semibold text-gray-900">{profile.fullName || "Campus User"}</h1>
            <p className="mt-1 text-center text-sm text-gray-500">{profile.department || "University of Ghana"}</p>

            <div className="mt-4 flex justify-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Trust Score: {Number(profile.trustScore || 0)}
              </span>
              {Boolean(profile.isVerified || String(profile.verificationStatus || "").toLowerCase() === "verified") && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Verified
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {profile.bio}
              </p>
            )}

            {joinedLabel && (
              <p className="mt-4 text-center text-xs text-gray-500">Joined {joinedLabel}</p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Public Reviews</h2>
              <div className="text-sm text-gray-600">
                {Number(summary?.averageRating || 0).toFixed(1)} / 5 ({summary?.ratingCount || 0})
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article key={review._id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">
                      {review?.reviewerId?.fullName || review?.reviewerId?.email || "Campus User"}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{review.rating}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{review.comment || "No comment provided."}</p>
                </article>
              ))}

              {reviews.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">
                  No public reviews yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
