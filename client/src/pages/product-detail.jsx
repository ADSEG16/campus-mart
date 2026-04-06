import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Heart, MessageCircle, MapPin, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import ConfirmInterestModal from "../components/ConfirmInterestModal";
import { fetchProductById } from "../api/products";
import { getStoredAuthToken } from "../api/http";
import { createOrder, listSellerReviews, reportReviewAbuse } from "../api/orders";
import { useToast } from "../context";

export default function ProductDetail() {
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [actionError, setActionError] = useState("");
    const [sellerReviews, setSellerReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, ratingCount: 0 });
    const [reportingReviewId, setReportingReviewId] = useState("");
    const { id } = useParams();
    const { showToast } = useToast();

    useEffect(() => {
        let isMounted = true;

        const loadProduct = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");
                const data = await fetchProductById(id);
                if (isMounted) {
                    setProduct(data);
                    setSelectedImage(0);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error.message || "Failed to load product details");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        let mounted = true;

        const loadSellerReviews = async () => {
            const sellerId = product?.seller?.id;
            if (!sellerId) {
                setSellerReviews([]);
                setReviewSummary({ averageRating: 0, ratingCount: 0 });
                return;
            }

            try {
                const result = await listSellerReviews({ sellerId });
                if (!mounted) return;
                setSellerReviews(result?.reviews || []);
                setReviewSummary(result?.summary || { averageRating: 0, ratingCount: 0 });
            } catch {
                if (!mounted) return;
                setSellerReviews([]);
                setReviewSummary({ averageRating: 0, ratingCount: 0 });
            }
        };

        loadSellerReviews();

        return () => {
            mounted = false;
        };
    }, [product?.seller?.id]);

    const handleReportReview = async (reviewId) => {
        const token = getStoredAuthToken();
        if (!token) {
            showToast("Please login to report a review.", "error");
            return;
        }

        const reason = window.prompt("Report reason (required):", "Abusive or inappropriate language");
        if (!reason || !reason.trim()) {
            return;
        }

        try {
            setReportingReviewId(reviewId);
            await reportReviewAbuse({ token, reviewId, reason: reason.trim() });

            setSellerReviews((prev) =>
                prev.map((review) =>
                    review._id === reviewId
                        ? {
                            ...review,
                            report: {
                                ...(review.report || {}),
                                isReported: true,
                                status: "pending",
                            },
                        }
                        : review
                )
            );

            showToast("Review reported successfully.", "success");
        } catch (error) {
            showToast(error.message || "Failed to report review.", "error");
        } finally {
            setReportingReviewId("");
        }
    };

    const images = useMemo(() => {
        if (product?.images && product.images.length > 0) {
            return product.images;
        }

        return ["/vite.svg"];
    }, [product]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar variant="product" />
                <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4 py-10">
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                        Loading product details...
                    </div>
                </div>
            </div>
        );
    }

    if (errorMessage || !product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar variant="product" />
                <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4 py-10">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                        {errorMessage || "Product not found"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar variant="product" />
            
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-600 mb-6">
                    <Link to="/dashboard" className="hover:text-gray-900">Marketplace</Link>
                    <span className="mx-2">›</span>
                    <Link to="/dashboard" className="hover:text-gray-900">{product.category}</Link>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900">{product.title}</span>
                </div>

                {actionError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
                            <img
                                src={images[selectedImage]}
                                alt="Product"
                                className="w-full h-96 object-cover"
                            />
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`shrink-0 bg-white rounded-lg overflow-hidden border-2 ${
                                        selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                                    }`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-24 sm:w-28 h-20 object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                    {product.condition}
                                </span>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Heart className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {product.title}
                            </h1>

                            <div className="text-4xl font-bold text-blue-600 mb-6">
                                {product.price}
                            </div>

                            {/* Seller Info */}
                            <div className="border-t border-b border-gray-200 py-4 mb-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start">
                                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mr-3 shrink-0">
                                            <span className="text-orange-600 font-semibold">{product.seller.avatar}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-gray-900">{product.seller.name}</span>
                                                {product.seller.verified && (
                                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Verified seller
                                                    </span>
                                                )}
                                                {product.seller.emailVerified && (
                                                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                                        Email verified
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 break-all">{product.seller.email}</div>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star className="w-5 h-5 fill-current" />
                                                <span className="font-semibold text-gray-900">{product.seller.rating}</span>
                                                <span className="text-sm text-gray-500">rating</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Link 
                                    to={`/messages?chat=${product.seller.id}`}
                                    className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Message Seller
                                </Link>
                            </div>

                            {/* Action Buttons */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center mb-3"
                            >
                                <span className="mr-2">💰</span>
                                Confirm Interest / COD
                            </button>

                            {/* Meeting Preferences */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-gray-900 mb-2">Meeting Preferences</div>
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            {product.meetingPreferences.map((pref, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                                    {pref}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Item Description */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Description</h2>
                            <p className="text-gray-700 mb-4">
                                {product.description}
                            </p>
                            
                            <h3 className="font-semibold text-gray-900 mb-2">Highlights:</h3>
                            <ul className="space-y-2">
                                {product.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                        <span className="text-blue-600 mr-2">○</span>
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm mt-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold text-gray-900">Seller Reviews</h2>
                                <div className="text-sm text-gray-600">
                                    {Number(reviewSummary?.averageRating || 0).toFixed(1)} / 5 ({reviewSummary?.ratingCount || 0})
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {sellerReviews.map((review) => (
                                    <div key={review._id} className="rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {review?.reviewerId?.fullName || review?.reviewerId?.email || "Campus User"}
                                                </p>
                                                <div className="mt-1 flex items-center gap-1 text-yellow-500">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span className="text-sm text-gray-900">{review.rating}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleReportReview(review._id)}
                                                disabled={reportingReviewId === review._id || review?.report?.status === "pending"}
                                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                            >
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                {review?.report?.status === "pending" ? "Reported" : "Report abuse"}
                                            </button>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700">{review.comment || "No comment provided."}</p>
                                    </div>
                                ))}

                                {sellerReviews.length === 0 && (
                                    <p className="text-sm text-gray-500">No reviews yet for this seller.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <ConfirmInterestModal
                    product={product}
                    onClose={() => setShowModal(false)}
                    onConfirm={async () => {
                        try {
                            const token = getStoredAuthToken();
                            if (!token) {
                                setActionError("Please login to create an order.");
                                setShowModal(false);
                                return;
                            }

                            await createOrder({
                                token,
                                items: [{ productId: product.id, quantity: 1 }],
                            });

                            setShowModal(false);
                            window.location.href = `/messages?chat=${product?.seller?.id || ""}`;
                        } catch (error) {
                            setActionError(error.message || "Failed to create order.");
                            setShowModal(false);
                        }
                    }}
                />
            )}
        </div>
    );
}