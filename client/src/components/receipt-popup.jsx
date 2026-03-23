import React, { useRef } from "react";
import { 
  Download,
  Printer,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Shield,
  BookOpen,
  X
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ReceiptPopup = ({ transactionId, onClose, onDownload, onPrint }) => {
  const receiptRef = useRef(null);

  // Mock receipt data based on transaction ID
  const receiptDataMap = {
    1: {
      seller: "Sarah M.",
      buyer: "Alex Johnson",
      product: "Noise Cancelling Headphones",
      condition: "Like New",
      usage: "Used for 2 Months",
      subtotal: "$45.00",
      platformFee: "Free",
      total: "$45.00",
      meetingLocation: "Campus North Library",
      meetingSpot: "Main Entrance Lounge",
      completionTime: "2:45 PM",
      completionDate: "October 12, 2024",
      orderId: "#CM-8829104"
    },
    2: {
      seller: "David L.",
      buyer: "Alex Johnson",
      product: "Biology Vol 1. Textbook",
      condition: "Like New",
      usage: "Used for 1 Semester",
      subtotal: "$120.00",
      platformFee: "Free",
      total: "$120.00",
      meetingLocation: "Campus North Library",
      meetingSpot: "Main Entrance Lounge",
      completionTime: "3:30 PM",
      completionDate: "October 08, 2024",
      orderId: "#CM-8832105"
    },
    3: {
      seller: "Ryan K.",
      buyer: "Alex Johnson",
      product: "Study Desk Lamp",
      condition: "Good",
      usage: "Used for 3 Months",
      subtotal: "$15.00",
      platformFee: "Free",
      total: "$15.00",
      meetingLocation: "Campus Library",
      meetingSpot: "Study Room 3",
      completionTime: "Cancelled",
      completionDate: "September 24, 2024",
      orderId: "#CM-8843901"
    },
    4: {
      seller: "Jordan W.",
      buyer: "Alex Johnson",
      product: "Dorm Mini Fridge",
      condition: "Excellent",
      usage: "Used for 4 Months",
      subtotal: "$85.00",
      platformFee: "Free",
      total: "$85.00",
      meetingLocation: "North Campus",
      meetingSpot: "Parking Lot B",
      completionTime: "4:45 PM",
      completionDate: "September 15, 2024",
      orderId: "#CM-8856723"
    }
  };

  const receiptData = receiptDataMap[transactionId] || receiptDataMap[1];

  const generatePDF = async () => {
    if (!receiptRef.current) return;

    try {
      // Show loading state (optional)
      const button = document.querySelector('.download-button');
      const originalText = button.innerHTML;
      button.innerHTML = 'Generating PDF...';
      button.disabled = true;

      // Capture the receipt element as canvas
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width * 0.75, canvas.height * 0.75] // Slightly smaller than canvas
      });

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      
      // Download PDF
      pdf.save(`CampusMart_Receipt_${receiptData.orderId.replace('#', '')}.pdf`);

      // Call external onDownload callback if provided
      if (onDownload) {
        onDownload();
      }

      // Reset button state
      button.innerHTML = originalText;
      button.disabled = false;

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Reset button state
      const button = document.querySelector('.download-button');
      if (button) {
        button.innerHTML = 'Download PDF';
        button.disabled = false;
      }
    }
  };

  const handleDownload = () => {
    generatePDF();
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    window.print();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Receipt Content - This will be captured for PDF */}
        <div ref={receiptRef} className="bg-white">
          {/* Receipt Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">CampusMart</h1>
                <p className="text-blue-100 text-sm">DIGITAL RECEIPT</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white text-xs font-medium">Order ID</p>
                <p className="text-white font-mono text-sm">{receiptData.orderId}</p>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-200 border-b border-gray-200">
            {/* Seller Info */}
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">SELLER</p>
                  <p className="text-lg font-bold text-gray-900">{receiptData.seller}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Verified Student</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">BUYER</p>
                  <p className="text-lg font-bold text-gray-900">{receiptData.buyer}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Verified Student</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-6 border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{receiptData.product}</h2>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-600">{receiptData.condition}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{receiptData.usage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-6 ml-5 mr-5 border rounded-2xl border-gray-200 bg-gray-50/50">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{receiptData.subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Platform Fee (0%)</span>
                <span className="text-green-600 font-medium">{receiptData.platformFee}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-md font-semibold text-gray-900">Total Paid (COD)</span>
                  <span className="text-2xl font-bold text-blue-600">{receiptData.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="p-6 border rounded-2xl m-5 border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">MEETING DETAILS & VERIFICATION</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{receiptData.meetingLocation}</p>
                  <p className="text-sm text-gray-600">{receiptData.meetingSpot}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Completed at {receiptData.completionTime}</p>
                  <p className="text-sm text-gray-600">{receiptData.completionDate}</p>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Transaction verified via CampusMart Secure Handshake
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              This is an electronically generated receipt for a student-to-student transaction. 
              CampusMart facilitates the connection but does not handle payments. All COD transactions 
              are at users' discretion.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownload}
              className="download-button flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPopup;