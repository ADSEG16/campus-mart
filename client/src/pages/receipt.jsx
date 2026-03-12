import React from "react";
import { useNavigate } from "react-router-dom";
import DigitalReceipt from "../components/receipt";

const ReceiptPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
    // or navigate('/transactions') to go to transaction history
  };

  const handleDownload = () => {
    console.log("Downloading PDF...");
    // Implement PDF download logic here
  };

  const handlePrint = () => {
    console.log("Printing receipt...");
    window.print();
  };

  return (
    <DigitalReceipt
      onBack={handleBack}
      onDownload={handleDownload}
      onPrint={handlePrint}
    />
  );
};

export default ReceiptPage;