// frontend\src\components\settings_components\admin_settings_components\StaticPagesSection.tsx
import { Stack, TextField, Button } from "@mui/material";

type StaticPages = {
  aboutUs: string;
  returnPolicy: string;
  paymentMethods: string;
  shippingMethods: string;
  privacyPolicy: string;
  termsOfUse: string;
};

type Props = {
  staticPages: StaticPages;
  setStaticPages: React.Dispatch<React.SetStateAction<StaticPages>>;
  onSave: () => void;
};

const StaticPagesSection = ({
  staticPages,
  setStaticPages,
  onSave,
}: Props) => {
  return (
    <Stack spacing={3} maxWidth={600}>
      <TextField
        label="About Us"
        multiline
        minRows={4}
        value={staticPages.aboutUs}
        onChange={(e) =>
          setStaticPages((p) => ({ ...p, aboutUs: e.target.value }))
        }
      />

      <TextField
        label="Return Policy"
        multiline
        minRows={4}
        value={staticPages.returnPolicy}
        onChange={(e) =>
          setStaticPages((p) => ({ ...p, returnPolicy: e.target.value }))
        }
      />

      <TextField
        label="Payment Methods"
        multiline
        minRows={4}
        value={staticPages.paymentMethods}
        onChange={(e) =>
          setStaticPages((p) => ({
            ...p,
            paymentMethods: e.target.value,
          }))
        }
      />

      <TextField
        label="Shipping Methods"
        multiline
        minRows={4}
        value={staticPages.shippingMethods}
        onChange={(e) =>
          setStaticPages((p) => ({
            ...p,
            shippingMethods: e.target.value,
          }))
        }
      />

      <TextField
        label="Privacy Policy"
        multiline
        minRows={4}
        value={staticPages.privacyPolicy}
        onChange={(e) =>
          setStaticPages((p) => ({
            ...p,
            privacyPolicy: e.target.value,
          }))
        }
      />

      <TextField
        label="Terms of Use"
        multiline
        minRows={4}
        value={staticPages.termsOfUse}
        onChange={(e) =>
          setStaticPages((p) => ({
            ...p,
            termsOfUse: e.target.value,
          }))
        }
      />

      <Button variant="contained" onClick={onSave}>
        Save Static Pages
      </Button>
    </Stack>
  );
};

export default StaticPagesSection;
