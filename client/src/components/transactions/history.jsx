import React, { useState } from "react";
import { 
  Download,
  Image as ImageIcon,
  Check,
  X,
  X as XIcon
} from "lucide-react";
import TransactionDetails from "./TransactionDetails";
import SellerRatingPopup from "../popup-rating";
import ReceiptPopup from "../receipt-popup"; // Import the receipt popup

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("All Transactions");
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false); // New state for receipt popup
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const tabs = ["All Transactions", "Purchases", "Sales"];
  
  const transactions = [
    {
      id: 1,
      title: "Noise Cancelling Headphones",
      date: "Oct 12, 2024",
      seller: "Sarah M.",
      verified: true,
      status: "Completed - COD",
      amount: "GHC45.00",
      cancelled: false,
      type: "purchase",
      image: null
    },
    {
      id: 2,
      title: "Biology Vol 1. Textbook",
      date: "Oct 08, 2024",
      seller: "David L.",
      verified: true,
      status: "Completed - COD",
      amount: "GHC120.00",
      cancelled: false,
      type: "purchase",
      image: null
    },
    {
      id: 3,
      title: "Study Desk Lamp",
      date: "Sept 24, 2024",
      seller: "Ryan K.",
      verified: false,
      status: "Cancelled",
      amount: "GHC15.00",
      cancelled: true,
      type: "sale",
      image: null
    },
    {
      id: 4,
      title: "Dorm Mini Fridge",
      date: "Sept 15, 2024",
      seller: "Jordan W.",
      verified: false,
      status: "Completed - COD",
      amount: "GHC85.00",
      cancelled: false,
      type: "purchase",
      image: null
    }
  ];

  // Handle opening details sheet
  const handleViewDetails = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowDetailsSheet(true);
  };

  // Handle closing details sheet
  const handleCloseSheet = () => {
    setShowDetailsSheet(false);
    setSelectedTransactionId(null);
  };

  // Handle view receipt
  const handleViewReceipt = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowReceiptPopup(true);
  };

  // Handle closing receipt popup
  const handleCloseReceipt = () => {
    setShowReceiptPopup(false);
    setSelectedTransactionId(null);
  };

  // Handle rating popup open
  const handleRatingPopupOpen = (transaction) => {
    setShowDetailsSheet(false);
    if (transaction) {
      setSelectedTransaction(transaction);
      setShowRatingPopup(true);
    }
  };

  // Handle closing rating popup
  const handleCloseRatingPopup = () => {
    setShowRatingPopup(false);
    setSelectedTransaction(null);
  };

  // Handle submitting the review
  const handleSubmitReview = (reviewData) => {
    console.log("Review submitted:", reviewData);
    setShowRatingPopup(false);
    setSelectedTransaction(null);
    alert("Thank you for your review!");
  };

  // Handle download receipt
  const handleDownloadReceipt = () => {
    console.log("Downloading receipt...");
    // This will be triggered from the ReceiptPopup component
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    console.log("Printing receipt...");
    // This will be triggered from the ReceiptPopup component
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "All Transactions") return true;
    if (activeTab === "Purchases") return transaction.type === "purchase";
    if (activeTab === "Sales") return transaction.type === "sale";
    return true;
  });

  return (
    <div className="max-w-7xl p-6 relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-gray-600">Review your past buys and sells within the campus community.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b-2 border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>

                {/* Transaction Details */}
                <div className="flex-1">
                  {/* Top row with title and amount */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{transaction.title}</h3>
                    <div className="text-lg font-bold text-gray-900">
                      {transaction.amount}
                    </div>
                  </div>

                  {/* Middle row with date, seller, status */}
                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <span className="text-gray-500">{transaction.date}</span>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-700">{transaction.seller}</span>
                      {transaction.verified ? (
                        <Check className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className={`${
                      transaction.cancelled ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>

                  {/* Bottom row with action buttons */}
                  <div className="flex items-center space-x-3 text-sm">
                    <button 
                      onClick={() => handleViewDetails(transaction.id)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Details
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      onClick={() => handleViewReceipt(transaction.id)}
                      className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No {activeTab.toLowerCase()} found
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing 1–{filteredTransactions.length} of {filteredTransactions.length} transactions
        </div>
      )}

      {/* Transaction Details Sheet Overlay */}
      {showDetailsSheet && selectedTransactionId && (
        <div 
          className="fixed inset-0 z-40 transition-opacity backdrop-blur-sm"
          onClick={handleCloseSheet}
        >
          <div 
            className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/3 bg-white shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
              <button
                onClick={handleCloseSheet}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Sheet Content */}
            <div className="p-6">
              <TransactionDetails 
                transactionId={selectedTransactionId}
                isSheet={true}
                onRatingPopupOpen={handleRatingPopupOpen}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rating Popup */}
      {showRatingPopup && selectedTransaction && (
        <SellerRatingPopup
          sellerName={selectedTransaction.seller}
          productName={selectedTransaction.title}
          onClose={handleCloseRatingPopup}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* Receipt Popup */}
      {showReceiptPopup && selectedTransactionId && (
        <ReceiptPopup
          transactionId={selectedTransactionId}
          onClose={handleCloseReceipt}
          onDownload={handleDownloadReceipt}
          onPrint={handlePrintReceipt}
        />
      )}
    </div>
  );
};

export default TransactionHistory;