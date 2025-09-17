import { Box, Button, FormControlLabel, Paper, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useCheckout } from "../hooks/useCheckout";

// import BoxNowWidget from "../components/store_components/BoxNowWidget";

const ShippingInfo = () => {
  const [form, setForm] = useState({
    shippingEmail: "",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    notes: "",
    shippingMethod: "courier"
  });

  const { handleCheckout } = useCheckout();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Checkout form submitted", form);
    handleCheckout(form); 
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
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
            label="Email"
            value={form.shippingEmail}
            onChange={(e) => handleChange("shippingEmail", e.target.value)}
            required
          />
          <TextField
            label="Full name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
          <TextField
            label="Address Line 1"
            value={form.addressLine1}
            onChange={(e) => handleChange("addressLine1", e.target.value)}
            required
          />
          <TextField
            label="Address Line 2"
            value={form.addressLine2}
            onChange={(e) => handleChange("addressLine2", e.target.value)}
          />
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
          <TextField
            label="Postal Code"
            value={form.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            required
          />
          <TextField
            label="Country"
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
            required
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" type="submit">
              Συνεχεια στο Checkout
            </Button>
          </Box>
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
          <Typography variant="h6" gutterBottom>
            Τρόπος Αποστολής
          </Typography>
          <RadioGroup
            value={form.shippingMethod}
            onChange={(e) => handleChange("shippingMethod", e.target.value)}
          >
            <FormControlLabel
              value="courier"
              control={<Radio />}
              label="Αποστολή με Courier: 3,50 €"
            />
            <FormControlLabel
              value="boxnow"
              control={<Radio />}
              label="BOX NOW Lockers | Γρήγορη παράδοση, 24/7: 2,50 €"
            />
            <FormControlLabel
              value="pickup"
              control={<Radio />}
              label="Παραλαβή από το κατάστημα: 0 €"
            />
          </RadioGroup>
        </Paper>
        
      </Box>

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

  )
}
export default ShippingInfo