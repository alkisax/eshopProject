// frontend\src\components\store_components\adminPannelCommodity\AdminTransactionPanelComponents\TransactionDetailsDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import type {
  TransactionType,
  ParticipantType,
} from "../../../../types/commerce.types";
// import OsmAddressCheck from "../../ShippingInfoComponents/OsmAddressCheck";
import { useState } from "react";

interface Props {
  open: boolean;
  transaction: TransactionType | null;
  onClose: () => void;
}

const TransactionDetailsDialog = ({ open, transaction, onClose }: Props) => {
  const [showMap, setShowMap] = useState(false);

  if (!transaction) return null;

  const participant = transaction.participant as ParticipantType;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transaction Details</DialogTitle>

      <DialogContent dividers>
        <>
          <Typography variant="subtitle1">Customer:</Typography>
          <Typography variant="body2">
            {participant?.name} {participant?.surname}
          </Typography>
          <Typography variant="body2">{participant?.email}</Typography>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Items:
          </Typography>

          <List dense>
            {transaction.items.map((item, idx) => {
              // δεν θέλουμε στα variants να μας δείχνει το id
              const variant = item.commodity?.variants?.find(
                (v) => v._id === item.variantId,
              );

              return (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`${item.commodity.name} × ${item.quantity}`}
                    secondary={
                      <>
                        <span>{`${item.priceAtPurchase}€ each`}</span>
                        {item.variantId && variant && (
                          <>
                            <br />
                            <span>
                              Variant:{" "}
                              {Object.entries(variant.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </span>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>

          <Typography
            variant="subtitle1"
            sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
          >
            <span>Total Amount:</span>
            <strong>{transaction.amount} €</strong>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Shipping Info:
          </Typography>

          {transaction.shipping ? (
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2">
                {transaction.shipping.fullName}
              </Typography>
              <Typography variant="body2">
                {transaction.shipping.addressLine1}
              </Typography>
              {transaction.shipping.addressLine2 && (
                <Typography variant="body2">
                  {transaction.shipping.addressLine2}
                </Typography>
              )}
              <Typography variant="body2">
                {transaction.shipping.postalCode}, {transaction.shipping.city}
              </Typography>
              <Typography variant="body2">
                {transaction.shipping.country}
              </Typography>
              <Typography variant="body2">
                Phone: {transaction.shipping.phone}
              </Typography>
              <Typography variant="body2">
                Notes: {transaction.shipping.notes}
              </Typography>

              {/* 🗺️ MAP TOGGLE */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowMap((p) => !p)}
                >
                  {showMap ? "Κλείσιμο χάρτη" : "Έλεγχος στον χάρτη"}
                </Button>
              </Box>

              {/* {showMap && (
                <Box sx={{ mt: 2 }}>
                  <OsmAddressCheck
                    addressLine1={transaction.shipping.addressLine1}
                    addressLine2={transaction.shipping.addressLine2}
                    city={transaction.shipping.city}
                    postalCode={transaction.shipping.postalCode}
                    country={transaction.shipping.country}
                    height={280}
                  />
                </Box>
              )} */}
            </Box>
          ) : (
            <Typography variant="body2">No shipping info available.</Typography>
          )}
        </>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetailsDialog;
