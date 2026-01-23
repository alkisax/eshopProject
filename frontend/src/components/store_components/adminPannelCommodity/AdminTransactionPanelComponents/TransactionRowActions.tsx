// frontend\src\components\store_components\adminPannelCommodity\AdminTransactionPanelComponents\TransactionRowActions.tsx
import { Box, Button, Stack } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TransactionPdfActions from "./TransactionPdfActions";
import type { TransactionType } from "../../../../types/commerce.types";

interface Props {
  transaction: TransactionType;

  onConfirm: (id: string) => void;
  onShip: (id: string) => void;
  onReset?: (id: string, t: TransactionType) => void;
}

const TransactionRowActions = ({
  transaction,
  onConfirm,
  onShip,
  onReset,
}: Props) => {
  const id = transaction._id?.toString();
  if (!id) return null;

  return (
    <>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {transaction.status === "pending" && (
            <Button
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(id);
              }}
            >
              Confirm & Send Email
            </Button>
          )}

          {transaction.status === "confirmed" && (
            <Button
              size="small"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                onShip(id);
              }}
            >
              Mark Shipped
            </Button>
          )}
          {/* DEV reset */}
          {transaction.processed && onReset && (
            <Button
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                onReset(id, transaction);
              }}
              title="DEV: reset transaction to pending"
            >
              <RestartAltIcon fontSize="small" />
            </Button>
          )}
        </Stack>

        {/* PDF */}
        <Box onClick={(e) => e.stopPropagation()}>
          <TransactionPdfActions transactionId={id} />
        </Box>
      </Stack>
    </>
  );
};

export default TransactionRowActions;
