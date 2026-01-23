// frontend\src\components\store_components\checkout_components\LastTransactionSummary.tsx
import {
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  Alert,
} from "@mui/material";
import type { CartItemType, TransactionType } from "../../../types/commerce.types";

interface Props {
  lastTransaction: TransactionType;
  getVariantLabel: (item: CartItemType) => string | null;
}

const LastTransactionSummary = ({ lastTransaction, getVariantLabel }: Props) => {
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h5" gutterBottom>
        🛍️ Τελευταία αγορά
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        {new Date(lastTransaction.createdAt!).toLocaleString()}
      </Typography>

      <List dense>
        {lastTransaction.items.map((item, idx) => (
          <ListItem key={idx} sx={{ borderBottom: "1px dashed #ddd" }}>
            {item.commodity.images &&
              item.commodity.images?.length > 0 && (
                <Box
                  component="img"
                  src={item.commodity.images[0]}
                  alt={item.commodity?.name}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    mr: 2,
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
              )}

            <ListItemText
              primary={`${item.commodity.name} × ${item.quantity}`}
              secondary={`${item.priceAtPurchase}€ / τεμ.`}
            />
            <ListItemText
              secondary={
                <>
                  {getVariantLabel(item) && (
                    <>
                      <br />
                      <span>Variant: {getVariantLabel(item)}</span>
                    </>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 2, textAlign: "right" }}>
        Σύνολο: {lastTransaction.amount}€
      </Typography>

      <Alert severity="success" sx={{ mt: 3, fontWeight: "bold" }}>
        📧 Θα λάβετε σύντομα επιβεβαίωση με email
      </Alert>
    </>
  );
};

export default LastTransactionSummary;
