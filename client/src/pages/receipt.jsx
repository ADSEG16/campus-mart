import { useNavigate, useParams } from "react-router-dom";
import ReceiptPopup from "../components/receipt-popup";

const ReceiptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    console.log("Downloading PDF...");
  };

  const handlePrint = () => {
    console.log("Printing receipt...");
    window.print();
  };

  return (
    <ReceiptPopup
      transactionId={id}
      onClose={handleBack}
      onDownload={handleDownload}
      onPrint={handlePrint}
    />
  );
};

export default ReceiptPage;