import React, { useState } from "react";
import { 
  ChevronRight, 
  Download,
  Star,
  Image as ImageIcon,
  Check,
  X
} from "lucide-react";

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("All Transactions");
  
  const tabs = ["All Transactions", "Purchases", "Sales"];
  
  const transactions = [
    {
      id: 1,
      title: "Noise Cancelling Headphones",
      date: "Oct 12, 2024",
      seller: "Sarah M.",
      verified: true,
      status: "Completed - COD",
      amount: "$45.00",
      cancelled: false,
      type: "purchase", // Adding transaction type
      image: null
    },
    {
      id: 2,
      title: "Biology Vol 1. Textbook",
      date: "Oct 08, 2024",
      seller: "David L.",
      verified: true,
      status: "Completed - COD",
      amount: "$120.00",
      cancelled: false,
      type: "purchase", // Adding transaction type
      image: null
    },
    {
      id: 3,
      title: "Study Desk Lamp",
      date: "Sept 24, 2024",
      seller: "Ryan K.",
      verified: false,
      status: "Cancelled",
      amount: "$15.00",
      cancelled: true,
      type: "sale", // Adding transaction type
      image: null
    },
    {
      id: 4,
      title: "Dorm Mini Fridge",
      date: "Sept 15, 2024",
      seller: "Jordan W.",
      verified: false,
      status: "Completed - COD",
      amount: "$85.00",
      cancelled: false,
      type: "purchase", // Adding transaction type
      image: null
    }
  ];

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "All Transactions") return true;
    if (activeTab === "Purchases") return transaction.type === "purchase";
    if (activeTab === "Sales") return transaction.type === "sale";
    return true;
  });

  return (
    <div className="max-w-7xl p-6">
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
              className="bg-white rounded-lg border border-gray-200 p-4"
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

                  {/* Middle row with date, seller, status - exactly as in image */}
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
                    {transaction.id === 1 && (
                      <>
                        <button className="text-blue-600 hover:text-blue-700">Details</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </>
                    )}
                    {transaction.id === 2 && (
                      <>
                        <button className="text-blue-600 hover:text-blue-700">Details</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </>
                    )}
                    {transaction.id === 3 && (
                      <span className="text-gray-400">No Action</span>
                    )}
                    {transaction.id === 4 && (
                      <>
                        <button className="text-blue-600 hover:text-blue-700">Details</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </>
                    )}
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

      {/* Pagination - Only show if there are transactions */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing 1–{filteredTransactions.length} of {filteredTransactions.length} transactions
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;