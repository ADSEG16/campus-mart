import React, { useEffect, useState } from "react";
import { 
  Calendar,
  MapPin,
  Download,
  Star,
  User,
  Image as ImageIcon,
  Check,
  X
} from "lucide-react";

const TransactionDetails = ({ transactionId, isSheet = false }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - In real app, fetch from API using the ID
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock transaction data based on ID
      const mockTransactions = {
        1: {
          id: "#CM-8829104",
          title: "Noise Cancelling Headphones",
          date: "Oct 12, 2024",
          time: "02:30 PM",
          paymentMethod: "Cash on Delivery (COD)",
          seller: "Sarah M.",
          sellerVerified: true,
          price: "$45.00",
          status: "Completed",
          cancelled: false,
          image: null,
          progress: [
            { step: "Interest Confirmed", date: "Oct 10, 2024", time: "10:15 AM", completed: true },
            { step: "Meeting Scheduled", date: "Oct 11, 2024", time: "04:20 PM", 
              note: "Confirmed for Central Library Plaza", completed: true },
            { step: "Completed", date: "Oct 12, 2024", time: "02:45 PM", completed: true }
          ],
          meetingPoint: "LIBRARY NORTH WING"
        },
        2: {
          id: "#CM-8832105",
          title: "Biology Vol 1. Textbook",
          date: "Oct 08, 2024",
          time: "03:15 PM",
          paymentMethod: "Cash on Delivery (COD)",
          seller: "David L.",
          sellerVerified: true,
          price: "$120.00",
          status: "Completed",
          cancelled: false,
          image: null,
          progress: [
            { step: "Interest Confirmed", date: "Oct 06, 2024", time: "11:30 AM", completed: true },
            { step: "Meeting Scheduled", date: "Oct 07, 2024", time: "02:00 PM", 
              note: "Confirmed at Student Union", completed: true },
            { step: "Completed", date: "Oct 08, 2024", time: "03:30 PM", completed: true }
          ],
          meetingPoint: "STUDENT UNION - 2ND FLOOR"
        },
        3: {
          id: "#CM-8843901",
          title: "Study Desk Lamp",
          date: "Sept 24, 2024",
          time: "01:00 PM",
          paymentMethod: "Cash on Delivery (COD)",
          seller: "Ryan K.",
          sellerVerified: false,
          price: "$15.00",
          status: "Cancelled",
          cancelled: true,
          image: null,
          progress: [
            { step: "Interest Confirmed", date: "Sept 22, 2024", time: "09:45 AM", completed: true },
            { step: "Meeting Scheduled", date: "Sept 23, 2024", time: "11:30 AM", 
              note: "Scheduled at Library", completed: true },
            { step: "Cancelled", date: "Sept 24, 2024", time: "12:15 PM", 
              note: "Buyer cancelled", completed: false }
          ],
          meetingPoint: "LIBRARY - STUDY ROOM 3"
        },
        4: {
          id: "#CM-8856723",
          title: "Dorm Mini Fridge",
          date: "Sept 15, 2024",
          time: "04:30 PM",
          paymentMethod: "Cash on Delivery (COD)",
          seller: "Jordan W.",
          sellerVerified: false,
          price: "$85.00",
          status: "Completed",
          cancelled: false,
          image: null,
          progress: [
            { step: "Interest Confirmed", date: "Sept 13, 2024", time: "02:20 PM", completed: true },
            { step: "Meeting Scheduled", date: "Sept 14, 2024", time: "10:00 AM", 
              note: "Confirmed at North Campus", completed: true },
            { step: "Completed", date: "Sept 15, 2024", time: "04:45 PM", completed: true }
          ],
          meetingPoint: "NORTH CAMPUS - PARKING LOT B"
        }
      };

      setTransaction(mockTransactions[transactionId] || mockTransactions[1]);
      setLoading(false);
    }, 300);
  }, [transactionId]);

  const handleRateSeller = () => {
    console.log("Rate seller clicked for transaction:", transactionId);
  };

  const handleDownloadReceipt = () => {
    console.log("Downloading receipt for transaction:", transactionId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading transaction details...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12 text-gray-500">
        Transaction not found
      </div>
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

      {/* Product Title and Status */}
      {/* <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{transaction.title}</h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">{transaction.date}</span>
          <span className="text-gray-400">-</span>
          <span className={`font-medium ${transaction.cancelled ? 'text-red-500' : 'text-green-600'}`}>
            {transaction.status}
          </span>
          <span className="text-gray-400">-</span>
          <span className="text-gray-500">COD</span>
        </div>
      </div>

      <hr className="border-gray-200 mb-6" /> */}

      {/* Transaction Details Grid */}
      <div className="flex flex-col gap-8">
       {/* Left Column - Receipt Summary */}
            <div className="md:col-span-1 border rounded-2xl border-gray-200 shadow-2xs p-6">
           
            
            <div className="">
                <div className="flex items-start space-x-4">
                 {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>

                <div className=" p-2 ">
                    {/* Product and Order ID */}
                    <div className="mb-4">
                         <h4 className="text-sm font-semibold text-blue-500 mb-1">RECEIPT SUMMARY</h4>
                    <p className="font-bold text-2xl text-gray-900  text-wrap">{transaction.title}</p>
                    <p className="text-sm text-gray-500">Order ID: {transaction.id}</p>
                    </div>
            </div>
            </div>

                <hr className="border-gray-200 mb-4" />

                {/* Transaction Details */}
                <div className="space-y-3 ">
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
                    {transaction.seller} {transaction.sellerVerified ? '❤️' : ''}
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

        {/* bottom Column - Transaction Progress */}
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

          {/* Meeting Point */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg items-center justify-center flex flex-col">
            <div className="flex items-center space-x-2">
              <MapPin className="h-32 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Meeting Point</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">{transaction.meetingPoint}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-6">
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
    </div>
  );
};

export default TransactionDetails;