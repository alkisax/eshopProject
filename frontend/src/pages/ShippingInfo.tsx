// frontend\src\pages\ShippingInfo.tsx
import {
  Box,
  Button,
  // FormControlLabel,
  // Paper,
  // Radio,
  // RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
// import { useCheckout } from "../hooks/useCheckout";
import type { CartType, ShippingInfoType } from "../types/commerce.types";
// import ShippingInfoCart from "../components/store_components/ShippingInfoComponents/ShippingInfoCart";
import axios from "axios";
import { VariablesContext } from "../context/VariablesContext";
import IrisDialog from "../components/store_components/ShippingInfoComponents/IrisDialog";
import { useRef } from "react";
import ShippingSummaryPanel from "../components/store_components/ShippingInfoComponents/ShippingSummaryPanel";
import OsmAddressCheck from "../components/store_components/ShippingInfoComponents/OsmAddressCheck";
import { useCashOnDeliveryCheckout } from "../hooks/useCashOnDeliveryCheckout";
import { useNavigate } from "react-router-dom";
import { appendShippingMethodToNotes } from "../utils/shippingNotes";
import { useSettings } from "../context/SettingsContext";

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

  // const { handleCheckout } = useCheckout();
  const { handleCashOnDeliveryCheckout } = useCashOnDeliveryCheckout();

  const navigate = useNavigate();

  const { settings } = useSettings();
  const isShopOpen = settings?.shopOptions?.isOpen !== false; // default true αν δεν υπάρχει

  // το checkout του stripe είναι submit και έτσι δεν πατιόταν αν δεν είχαμε συμπληρώσει την φορμα. αλλα του iris δεν είναι submit και θα πρέπει να το εμποδισουμε να εμφανίζετε χωρίς συμπληρωμένη φόρμα αλλιώς
  // φτιάχνουμε ένα ref και το βάζουμε στο κουμπί της φορμας με ref={formRef}
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // αλλαγή για να περνα απο wait for aproval page
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("🚀 Checkout form submitted", form);
  //   handleCheckout(form);
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isShopOpen) return; // ⛔ shop closed
    if (!globalParticipant?._id) return;

    const sessionId = `STRIPE_${crypto.randomUUID()}`;
    const orderGroupId = crypto.randomUUID();
    const shippingWithNotes = appendShippingMethodToNotes(form);

    const shippingWithStripePlaceholder: ShippingInfoType = {
      ...shippingWithNotes,
      notes: [
        shippingWithNotes.notes,
        "[STRIPE_PLACEHOLDER]",
        `[ORDER_GROUP:${orderGroupId}]`,
      ]
        .filter(Boolean)
        .join("\n"),
    };

    const res = await axios.post(`${url}/api/transaction`, {
      participant: globalParticipant._id,
      sessionId,
      shipping: shippingWithStripePlaceholder,
    });

    const token = res.data.data.publicTrackingToken;

    navigate(`/order-waiting/${token}`, {
      state: {
        mode: "stripe",
        shippingInfo: shippingWithStripePlaceholder,
      },
    });
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
    0,
  );

  const method =
    form.shippingMethod === "courier" ||
    form.shippingMethod === "boxnow" ||
    form.shippingMethod === "pickup"
      ? form.shippingMethod
      : "pickup";

  const shippingCost = SHIPPING_COSTS[method];
  const total = subtotal + shippingCost;

  const handleOpenIris = () => {
    if (!isShopOpen) return; // ⛔ shop closed
    if (!formRef.current) return;
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity(); // δείχνει native errors
      return;
    }
    setOpenIris(true);
  };

  const handleCashOnDelivery = async () => {
    if (!isShopOpen) return; // ⛔ shop closed
    if (!formRef.current) return;
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }

    try {
      const result = await handleCashOnDeliveryCheckout(form);

      const token = result?.data?.publicTrackingToken;

      if (!token) {
        throw new Error("No tracking token returned from backend");
      }

      navigate(`/order-waiting/${token}`);
    } catch (err) {
      console.error("COD checkout failed", err);
    }
  };

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
        ref={formRef}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // 👈 responsive
          gap: 4,
        }}
        onSubmit={handleSubmit}
      >
        {/* 🟢 RIGHT column — FIRST on mobile */}
        <Box sx={{ order: { xs: 0, sm: 1 }, flex: 1 }}>
          <OsmAddressCheck
            addressLine1={form.addressLine1}
            addressLine2={form.addressLine2}
            city={form.city}
            postalCode={form.postalCode}
            country={form.country}
          />

          <ShippingSummaryPanel
            cart={cart}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            shippingMethod={form.shippingMethod}
            onChange={(v) => handleChange("shippingMethod", v)}
          />
        </Box>

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

          {/* buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {/* stripe */}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!isShopOpen}
            >
              Συνέχεια στο Checkout
            </Button>

            {/* iris */}
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleOpenIris}
              disabled={!isShopOpen}
            >
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="body2">
                  Πληρωμή με IRIS / Τραπεζικό QR
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    color: "text.disabled",
                    lineHeight: 1.2,
                  }}
                >
                  (εκτέλεση μετά από επιβεβαίωση πληρωμής)
                </Typography>
              </Stack>
            </Button>

            {/* cash on delivery */}
            <Button
              variant="outlined"
              color="info"
              onClick={handleCashOnDelivery}
              disabled={!isShopOpen}
            >
              Πληρωμή κατά την παραλαβή
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
                (η παραγγελία στέλνεται για έγκριση)
              </Typography>
            </Button>
          </Stack>
        </Stack>
      </Box>

      <IrisDialog
        open={openIris}
        onClose={() => setOpenIris(false)}
        totalAmount={total}
        shippingInfo={form}
      />

      {!isShopOpen && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "warning.light",
            color: "warning.contrastText",
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            ⚠️ Το κατάστημα είναι προσωρινά κλειστό.
          </Typography>
          <Typography variant="caption">
            Οι παραγγελίες δεν μπορούν να ολοκληρωθούν αυτή τη στιγμή.
          </Typography>
        </Box>
      )}

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
