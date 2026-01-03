// frontend\src\pages\ShippingInfo.tsx
import {
  Box,
  Button,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useCheckout } from "../hooks/useCheckout";
import type { CartType, ShippingInfoType } from "../types/commerce.types";
import ShippingInfoCart from "../components/store_components/ShippingInfoComponents/ShippingInfoCart";
import axios from "axios";
import { VariablesContext } from "../context/VariablesContext";
import IrisDialog from "../components/store_components/ShippingInfoComponents/IrisDialog";

// import BoxNowWidget from "../components/store_components/BoxNowWidget";

const ShippingInfo = () => {
  const [form, setForm] = useState<ShippingInfoType>({
    shippingEmail: "",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    notes: "",
    shippingMethod: "pickup",
  });
  const [openIris, setOpenIris] = useState<boolean>(false);

  const { handleCheckout } = useCheckout();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Checkout form submitted", form);
    handleCheckout(form);
  };

  // μεταφέραμε εδώ την λογική γιατί χρειάζετε και στα δύο child components
  // ΤΟDO hardcoded values should go to custom settings admin pannel
  const SHIPPING_COSTS = {
    courier: 3.25,
    boxnow: 3.25,
    pickup: 0,
  };

  const { url, globalParticipant } = useContext(VariablesContext);
  const [cart, setCart] = useState<CartType | null>(null);

  useEffect(() => {
    if (!globalParticipant?._id) return;

    axios
      .get(`${url}/api/cart/${globalParticipant._id}`)
      .then((res) => setCart(res.data.data))
      .catch(() => setCart(null));
  }, [globalParticipant?._id, url]);

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.commodity.price * item.quantity,
    0
  );

  const method =
    form.shippingMethod === "courier" ||
    form.shippingMethod === "boxnow" ||
    form.shippingMethod === "pickup"
      ? form.shippingMethod
      : "pickup";

  const shippingCost = SHIPPING_COSTS[method];
  const total = subtotal + shippingCost;

  return (
    <>
      <Helmet>
        <title>Στοιχεία Αποστολής | Έχω μια Ιδέα.</title>
        <meta
          name="description"
          content="Συμπληρώστε τη διεύθυνση αποστολής και επιλέξτε τρόπο παράδοσης για να ολοκληρώσετε την αγορά σας από το κατάστημά μας."
        />
        <link
          rel="canonical"
          href={window.location.origin + window.location.pathname}
        />
      </Helmet>

      <Typography component="h1" variant="h5" gutterBottom>
        Διεύθυνση Αποστολής
      </Typography>

      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // 👈 responsive
          gap: 4,
        }}
        onSubmit={handleSubmit}
      >
        {/* 🟢 Left column: address fields */}
        <Stack spacing={2} flex={1}>
          <TextField
            id="shipping-email"
            label="Email"
            value={form.shippingEmail}
            onChange={(e) => handleChange("shippingEmail", e.target.value)}
            required
          />
          <TextField
            id="shipping-full-name"
            label="Full name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
          <TextField
            id="shipping-address-line-1"
            label="Address Line 1"
            value={form.addressLine1}
            onChange={(e) => handleChange("addressLine1", e.target.value)}
            required
          />
          <TextField
            id="shipping-address-line-2"
            label="Address Line 2"
            value={form.addressLine2}
            onChange={(e) => handleChange("addressLine2", e.target.value)}
          />
          <TextField
            id="shipping-city"
            label="City"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
          <TextField
            id="shipping-postal-code"
            label="Postal Code"
            value={form.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            required
          />
          <TextField
            id="shipping-country"
            label="Country"
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
            required
          />
          <TextField
            id="shipping-phone"
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <TextField
            id="shipping-notes"
            label="Notes"
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            multiline
            rows={4}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" type="submit">
              Συνέχεια στο Checkout
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenIris(true)}
            >
              Πληρωμή με IRIS / Τραπεζικό QR
              <br />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.65rem",
                  color: "text.disabled",
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                (εκτέλεση μετά από επιβεβαίωση πληρωμής)
              </Typography>
            </Button>
          </Stack>
        </Stack>

        {/* 🟢 Right column: shipping methods */}
        <Paper
          sx={{
            flex: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          {cart && (
            <ShippingInfoCart
              cart={cart}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
            />
          )}
          <Typography variant="h6" gutterBottom sx={{ pt: 6 }}>
            Τρόπος Αποστολής
          </Typography>
          <RadioGroup
            value={form.shippingMethod}
            onChange={(e) => handleChange("shippingMethod", e.target.value)}
          >
            <FormControlLabel
              id="shipping-courier-option"
              value="courier"
              control={<Radio />}
              label="Αποστολή με Courier: 3,25 €"
            />
            <FormControlLabel
              id="shipping-boxnow-option"
              value="boxnow"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">
                    BOX NOW Lockers | Γρήγορη παράδοση, 24/7: 3,25 €
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ωσπου να ολοκληρωθεί η συνδεσή μας με το box now θα
                    αποστέλουμε το δέμα στην κοντινότερη στην διευθυνσή σας
                    θυρίδα
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              id="shipping-pickup-option"
              value="pickup"
              control={<Radio />}
              label="Παραλαβή από το κατάστημα: 0 €"
            />
          </RadioGroup>
        </Paper>
      </Box>

      <IrisDialog
        open={openIris}
        onClose={() => setOpenIris(false)}
        totalAmount={total}
      />

      {/* {form.shippingMethod === "boxnow" && (
        <BoxNowWidget
          partnerId={123} // 👈 το δικό σου ID
          onSelect={(locker) => {
            setForm((prev) => ({
              ...prev,
              lockerId: locker.boxnowLockerId,
              lockerAddress: locker.boxnowLockerAddressLine1,
              lockerPostalCode: locker.boxnowLockerPostalCode,
            }));
          }}
        />
      )} */}
    </>
  );
};
export default ShippingInfo;
