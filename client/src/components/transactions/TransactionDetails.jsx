import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { 
  Download,
  Star,
  User,
  Image as ImageIcon,
  Check,
  X
} from "lucide-react";
import SellerRatingPopup from "../popup-rating";
import ReceiptPopup from "../receipt-popup";
import { getStoredAuthToken } from "../../api/http";
import { confirmOrderDelivery, getOrderById, mapOrderToDetails, submitOrderReview, updateOrderStatus } from "../../api/orders";

const TransactionDetails = ({ 
  transactionId, 
  isSheet = false,
  onRatingPopupOpen // Prop to notify parent when rate seller is clicked
}) => {
  const params = useParams();
  const activeTransactionId = transactionId || params.id;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [receiptNotice, setReceiptNotice] = useState("");

  useEffect(() => {
    const loadTransaction = async () => {
      if (!activeTransactionId) {
        setLoading(false);
        return;
      }

      const authToken = getStoredAuthToken();
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

      if (!authToken) {
        setErrorMessage("Please login to view transaction details.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        const order = await getOrderById({ token: authToken, orderId: activeTransactionId });
        setTransaction(mapOrderToDetails(order, currentUser?._id));
      } catch (error) {
        setErrorMessage(error.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [activeTransactionId]);

  const handleRateSeller = () => {
    // If parent has callback, use it
    if (onRatingPopupOpen && transaction) {
      onRatingPopupOpen(transaction);
    } else {
      // Otherwise show popup locally
      setShowRatingPopup(true);
    }
  };

  const handleCloseRatingPopup = () => {
    setShowRatingPopup(false);
  };

  const handleSubmitRating = async (ratingData) => {
    try {
      const authToken = getStoredAuthToken();
      await submitOrderReview({
        token: authToken,
        orderId: activeTransactionId,
        rating: ratingData.rating,
        comment: ratingData.review,
      });
      setShowRatingPopup(false);
    } catch (error) {
      alert(error.message || "Failed to submit rating");
    }
  };

  const handleDownloadReceipt = () => {
    setShowReceiptPopup(true);
  };

  const handleCloseReceiptPopup = () => {
    setShowReceiptPopup(false);
  };

  const handleConfirmReceipt = async () => {
    if (!activeTransactionId) return;

    try {
      setIsConfirmingReceipt(true);
      setReceiptNotice("");

      const authToken = getStoredAuthToken();
      if (!authToken) {
        setReceiptNotice("Please login again to confirm receipt.");
        return;
      }

      const { order } = await confirmOrderDelivery({ token: authToken, orderId: activeTransactionId });
      let finalOrder = order;

      const bothConfirmed = Boolean(order?.buyerConfirmed) && Boolean(order?.sellerConfirmed);
      const isMeetupScheduled = String(order?.status || "").toLowerCase() === "meetup_scheduled";

      if (bothConfirmed && isMeetupScheduled) {
        try {
          finalOrder = await updateOrderStatus({
            token: authToken,
            orderId: activeTransactionId,
            payload: { nextStatus: "delivered" },
          });
          setReceiptNotice("Receipt confirmed. Order is now marked delivered.");
        } catch {
          setReceiptNotice("Receipt confirmed. Waiting for delivery status sync.");
        }
      } else {
        setReceiptNotice("Receipt confirmed. Waiting for the other party to confirm.");
      }

      const refreshedOrder = finalOrder?._id
        ? finalOrder
        : await getOrderById({ token: authToken, orderId: activeTransactionId });
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      setTransaction(mapOrderToDetails(refreshedOrder, currentUser?._id));
    } catch (error) {
      setReceiptNotice(error.message || "Failed to confirm receipt.");
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  const rawStatus = String(transaction?.raw?.status || "").toLowerCase();
  const isMeetupScheduled = rawStatus === "meetup_scheduled";
  const isCurrentUserSeller =
    String(transaction?.raw?.sellerId?._id || transaction?.raw?.sellerId || "") ===
    String(JSON.parse(localStorage.getItem("currentUser") || "{}")?._id || "");
  const currentUserConfirmed = isCurrentUserSeller
    ? Boolean(transaction?.raw?.sellerConfirmed)
    : Boolean(transaction?.raw?.buyerConfirmed);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading transaction details...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12 text-gray-500">{errorMessage || "Transaction not found"}</div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* CampusMart Header - Only show if not in sheet */}
      {!isSheet && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-xl font-semibold text-gray-700">CampusMart</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h2>
          <p className="text-gray-600">Review your past buys and sells within the campus community.</p>
        </div>
      )}

      {/* Transaction Details Grid */}
      <div className="flex flex-col gap-8">
        {/* Left Column - Receipt Summary */}
        <div className="md:col-span-1 border rounded-2xl border-gray-200 shadow-sm p-6">
          <div className="">
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>

              <div className="p-2">
                {/* Product and Order ID */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-blue-500 mb-1">RECEIPT SUMMARY</h4>
                  <p className="font-bold text-2xl text-gray-900 text-wrap">{transaction.title}</p>
                  <p className="text-sm text-gray-500">Order ID: {transaction.id}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Transaction Details */}
            <div className="space-y-3">
              <div className="flex flex-row justify-between">
                <p className="text-md text-gray-500 mb-1">Transaction Date</p>
                <p className="text-md text-gray-600 font-semibold">{transaction.date} • {transaction.time}</p>
              </div>
              
              <div className="flex flex-row justify-between">
                <p className="text-md text-gray-500 mb-1">Payment Method</p>
                <p className="text-md text-gray-600 font-semibold">{transaction.paymentMethod}</p>
              </div>
              
              <div className="flex flex-row justify-between">
                <p className="text-md text-gray-500 mb-1">Seller</p>
                <p className="text-md text-gray-600 font-semibold">
                  {transaction.seller} {transaction.sellerVerified ? '✓' : ''}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 my-4" />

            {/* Final Price */}
            <div className="flex flex-row justify-between">
              <p className="text-md text-gray-500 mb-1">Final Price</p>
              <p className="text-2xl font-bold text-blue-500">{transaction.price}</p>
            </div>
          </div>
        </div>

        {/* Bottom Column - Transaction Progress */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-500 mb-4">TRANSACTION PROGRESS</h4>
          
          <div className="space-y-6">
            {transaction.progress.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {step.completed ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-400" />
                    )}
                  </div>
                  {index < transaction.progress.length - 1 && (
                    <div className={`h-8 w-0.5 mt-1 ${
                      step.completed ? 'bg-green-200' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
                
                <div className="flex-1 pb-4">
                  <p className={`font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>{step.step}</p>
                  <p className="text-sm text-gray-500">
                    {step.date} • {step.time}
                  </p>
                  {step.note && (
                    <p className="text-sm text-gray-600 mt-1">{step.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Delivery confirmations: Buyer {transaction?.raw?.buyerConfirmed ? "confirmed" : "pending"} • Seller {transaction?.raw?.sellerConfirmed ? "confirmed" : "pending"}
          </div>

          {receiptNotice && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {receiptNotice}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-6">
            {isMeetupScheduled && !transaction.cancelled && (
              <button
                onClick={handleConfirmReceipt}
                disabled={isConfirmingReceipt || currentUserConfirmed}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors text-sm font-medium"
              >
                <span>
                  {isConfirmingReceipt ? "Confirming..." : currentUserConfirmed ? "Receipt Confirmed" : "Confirm Receipt"}
                </span>
              </button>
            )}
            {!transaction.cancelled && (
              <button 
                onClick={handleRateSeller}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Star className="h-4 w-4" />
                <span>Rate Seller</span>
              </button>
            )}
            <button 
              onClick={handleDownloadReceipt}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Download Receipt (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rating Popup - Rendered with Portal to ensure full-screen centering */}
      {showRatingPopup && createPortal(
        <SellerRatingPopup 
          sellerName={transaction.seller}
          productName={transaction.title}
          onClose={handleCloseRatingPopup}
          onSubmit={handleSubmitRating}
        />,
        document.body
      )}

      {/* Receipt Popup - Rendered with Portal to ensure full-screen centering */}
      {showReceiptPopup && createPortal(
        <ReceiptPopup 
          transactionId={activeTransactionId}
          onClose={handleCloseReceiptPopup}
          onDownload={() => console.log("Downloading receipt...")}
          onPrint={() => window.print()}
        />,
        document.body
      )}
    </div>
  );
};

export default TransactionDetails;