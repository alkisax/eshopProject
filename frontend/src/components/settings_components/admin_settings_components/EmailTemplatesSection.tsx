// frontend\src\components\settings_components\admin_settings_components\EmailTemplatesSection.tsx
import { TextField, Button, Stack, Typography } from "@mui/material";

type EmailTemplates = {
  orderConfirmed: {
    subject: string;
    body: string;
  };
  orderShipped: {
    subject: string;
    body: string;
  };
};

type Props = {
  emailTemplates: EmailTemplates;
  setEmailTemplates: React.Dispatch<React.SetStateAction<EmailTemplates>>;
  onSave: () => void;
};

const EmailTemplatesSection = ({
  emailTemplates,
  setEmailTemplates,
  onSave,
}: Props) => {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">Order confirmed email</Typography>

      <TextField
        label="Subject"
        fullWidth
        value={emailTemplates.orderConfirmed.subject}
        onChange={(e) =>
          setEmailTemplates((prev) => ({
            ...prev,
            orderConfirmed: {
              ...prev.orderConfirmed,
              subject: e.target.value,
            },
          }))
        }
      />

      <TextField
        label="Body"
        fullWidth
        multiline
        minRows={6}
        value={emailTemplates.orderConfirmed.body}
        onChange={(e) =>
          setEmailTemplates((prev) => ({
            ...prev,
            orderConfirmed: {
              ...prev.orderConfirmed,
              body: e.target.value,
            },
          }))
        }
        helperText="You can use placeholders like {{name}}, {{items}}, {{total}}, {{companyName}} "
      />

      <Typography variant="h6" sx={{ mt: 3 }}>
        Order shipped email
      </Typography>

      <TextField
        label="Subject"
        fullWidth
        value={emailTemplates.orderShipped.subject}
        onChange={(e) =>
          setEmailTemplates((prev) => ({
            ...prev,
            orderShipped: {
              ...prev.orderShipped,
              subject: e.target.value,
            },
          }))
        }
      />

      <TextField
        label="Body"
        fullWidth
        multiline
        minRows={6}
        value={emailTemplates.orderShipped.body}
        onChange={(e) =>
          setEmailTemplates((prev) => ({
            ...prev,
            orderShipped: {
              ...prev.orderShipped,
              body: e.target.value,
            },
          }))
        }
      />

      <Button variant="contained" onClick={onSave}>
        Save email templates
      </Button>
    </Stack>
  );
};

export default EmailTemplatesSection;
