import { X, ShoppingCart, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ConfirmInterestModal({ product, onClose, onConfirm }) {
    const navigate = useNavigate();

    const handleProceed = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            navigate('/messages');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Confirm Interest
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    You are expressing interest in {product?.title || "this item"}. You will now be connected with the seller to coordinate a safe on-campus meeting and complete the transaction via cash or digital transfer.
                </p>

                {/* Product Summary */}
                <div className="flex items-center bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="w-16 h-16 bg-teal-700 rounded-lg mr-4 flex items-center justify-center overflow-hidden shrink-0">
                        {product?.images?.[0] ? (
                            <img src={product.images[0]} alt={product.title || "Selected product"} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-white text-xs">📦</div>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{product?.title || "Selected product"}</div>
                        <div className="text-blue-600 font-bold">{product?.price || ""}</div>
                    </div>
                </div>

                <button 
                    onClick={handleProceed}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3 flex items-center justify-center cursor-pointer"
                >
                    <span className="mr-2">💬</span>
                    Proceed to Chat About {product?.title || "This Item"}
                </button>

                <button
                    onClick={onClose}
                    className="w-full px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                    Cancel
                </button>

                {/* Safety Tip */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">Safety Tip:</span> Always arrange to meet in designated{" "}
                            <Link to="/safety" className="text-blue-600 underline cursor-pointer">Safe Meeting Zones</Link> on campus.{" "}
                            <span className="font-semibold">Never share your private student ID details or bank login credentials.</span>
                        </p>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-500 mt-4">
                    The seller will be notified to confirm
                </div>
            </div>
        </div>
    );
}