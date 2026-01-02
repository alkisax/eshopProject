import axios from "axios";
import { IconButton, Tooltip } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useContext } from "react";
import { VariablesContext } from "../../../../context/VariablesContext";

type Props = {
  transactionId: string;
};

const TransactionPdfActions = ({ transactionId }: Props) => {
  const { url } = useContext(VariablesContext);

  const downloadInternalOrderPdf = async (transactionId: string) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${url}/api/pdf/internal-order/${transactionId}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `internal-order-${transactionId}.pdf`;
    link.click();
  };

  const downloadShippingInfoPdf = async (transactionId: string) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${url}/api/pdf/shipping-info/${transactionId}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shipping-info-${transactionId}.pdf`;
    link.click();
  };

  return (
    <>
      <Tooltip title="Download internal order (PDF)">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            downloadInternalOrderPdf(transactionId);
          }}
        >
          <DescriptionIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Download shipping label (PDF)">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            downloadShippingInfoPdf(transactionId);
          }}
        >
          <LocalShippingIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default TransactionPdfActions;
