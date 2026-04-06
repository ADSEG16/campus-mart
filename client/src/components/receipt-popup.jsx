import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Printer,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Shield,
  BookOpen,
  X,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getStoredAuthToken } from "../api/http";
import { getOrderById } from "../api/orders";

const toMoney = (amount) => `GHC ${Number(amount || 0).toFixed(2)}`;

const toDateTime = (value) => {
  if (!value) return { date: "", time: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };

  return {
    date: date.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const mapOrderToReceipt = (order) => {
  const item = order?.items?.[0]?.productId;
  const { date, time } = toDateTime(order?.updatedAt || order?.createdAt);

  return {
    orderId: `#${order?._id || "N/A"}`,
    seller: order?.sellerId?.fullName || order?.sellerId?.email || "Campus Seller",
    buyer: order?.buyerId?.fullName || order?.buyerId?.email || "Campus Buyer",
    product: item?.title || "Campus Mart Item",
    condition: item?.condition || "Used",
    subtotal: toMoney(order?.totalAmount),
    platformFee: "Free",
    total: toMoney(order?.totalAmount),
    meetingLocation: order?.meetupLocation || "Campus verified safe zone",
    completionTime: time || "Pending",
    completionDate: date || "Pending",
    status: order?.status || "Pending",
  };
};

const ReceiptPopup = ({ transactionId, orderData, onClose, onDownload, onPrint }) => {
  const receiptRef = useRef(null);
  const [receiptData, setReceiptData] = useState(() => (orderData ? mapOrderToReceipt(orderData) : null));
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(!orderData);

  useEffect(() => {
    if (orderData) {
      setReceiptData(mapOrderToReceipt(orderData));
      setIsLoading(false);
      return;
    }

    const loadOrder = async () => {
      if (!transactionId) {
        setErrorMessage("Transaction ID is required to load receipt.");
        setIsLoading(false);
        return;
      }

      const token = getStoredAuthToken();
      if (!token) {
        setErrorMessage("Please login again to view receipt.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const order = await getOrderById({ token, orderId: transactionId });
        setReceiptData(mapOrderToReceipt(order));
      } catch (error) {
        setErrorMessage(error.message || "Failed to load receipt");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderData, transactionId]);

  const canShowReceipt = useMemo(() => !isLoading && !errorMessage && receiptData, [isLoading, errorMessage, receiptData]);

  const generatePDF = async () => {
    if (!receiptRef.current || !receiptData) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width * 0.75, canvas.height * 0.75],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      pdf.save(`CampusMart_Receipt_${String(receiptData.orderId || "order").replace("#", "")}.pdf`);

      if (onDownload) onDownload();
    } catch (error) {
      setErrorMessage(error.message || "Failed to generate receipt PDF");
    }
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    window.print();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {isLoading && <div className="p-10 text-center text-gray-600">Loading receipt...</div>}
        {errorMessage && !isLoading && <div className="p-10 text-center text-red-700">{errorMessage}</div>}

        {canShowReceipt && (
          <>
            <div ref={receiptRef} className="bg-white">
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

              <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-200 border-b border-gray-200">
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

              <div className="p-6 border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{receiptData.product}</h2>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="text-gray-600">{receiptData.condition}</span>
                    </div>
                  </div>
                </div>
              </div>

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

              <div className="p-6 border rounded-2xl m-5 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">MEETING DETAILS & VERIFICATION</h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{receiptData.meetingLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{receiptData.status} at {receiptData.completionTime}</p>
                      <p className="text-sm text-gray-600">{receiptData.completionDate}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Transaction verified via CampusMart Secure Handshake
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  This is an electronically generated receipt for a student-to-student transaction.
                  CampusMart facilitates the connection but does not handle payments.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <button
                  onClick={generatePDF}
                  className="download-button flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptPopup;
