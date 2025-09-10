import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useCheckout } from "../hooks/useCheckout";

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
    notes: ""
  });

  const { handleCheckout } = useCheckout();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    handleCheckout(form); 
  };

  return (
    <>
      <h2>Shipping address</h2>
      <Box 
        component="form"
        sx={{
          display: 'flex',
          gap: 5
        }}
        onSubmit={handleSubmit}
      >
        <Stack
          spacing={2}
        >
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
          >
            Full name: 
          </TextField>
          <TextField
            label="Address Line 1"
            value={form.addressLine1}
            onChange={(e) => handleChange("addressLine1", e.target.value)}
            required
          >
            Address Line 1: 
          </TextField>
          <TextField
            label="Address Line 2"
            value={form.addressLine2}
            onChange={(e) => handleChange("addressLine2", e.target.value)}
          >
            AddressLine 2: 
          </TextField>
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          >
            City: 
          </TextField>
          <TextField
            label="Postal Code"
            value={form.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            required
          >
            Postal Code: 
          </TextField>
          <TextField
            label="Country"
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
            required
          >
            Country: 
          </TextField>
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          >
            Phone: 
          </TextField>
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            multiline
            rows={4}
            variant="outlined"
          />

          <Button variant="contained" color="primary" type="submit">
            Continue to Checkout
          </Button>
        </Stack>
      </Box>
    </>
  )
}
export default ShippingInfo