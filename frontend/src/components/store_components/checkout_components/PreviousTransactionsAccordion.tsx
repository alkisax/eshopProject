// frontend\src\components\store_components\checkout_components\PreviousTransactionsAccordion.tsx
import {
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { CartItemType, TransactionType } from "../../../types/commerce.types";

interface Props {
  transactions: TransactionType[];
  getVariantLabel: (item: CartItemType) => string | null;
}

const PreviousTransactionsAccordion = ({
  transactions,
  getVariantLabel,
}: Props) => {
  if (transactions.length <= 1) return null;

  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📜 Προηγούμενες Αγορές</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {transactions.slice(1).map((t) => (
              <ListItem key={t._id?.toString()}>
                <Stack>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {new Date(t.createdAt!).toLocaleString()}
                  </Typography>

                  {t.items.map((item, idx) => {
                    const variantLabel = getVariantLabel(item);

                    return (
                      <Typography key={idx} variant="body2">
                        {item.commodity.name} × {item.quantity} —{" "}
                        {item.priceAtPurchase}€
                        {variantLabel && (
                          <>
                            <br />
                            <span
                              style={{
                                color: "#666",
                                fontSize: "0.85em",
                              }}
                            >
                              Variant: {variantLabel}
                            </span>
                          </>
                        )}
                      </Typography>
                    );
                  })}

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Σύνολο:</strong> {t.amount}€
                  </Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default PreviousTransactionsAccordion;
