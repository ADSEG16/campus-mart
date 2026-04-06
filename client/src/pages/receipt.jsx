import { useNavigate, useParams } from "react-router-dom";
import ReceiptPopup from "../components/receipt-popup";
import { useToast } from "../context";

const ReceiptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    showToast("Receipt PDF downloaded successfully.", "success");
  };

  const handlePrint = () => {
    showToast("Opening print dialog...", "info", 1200);
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