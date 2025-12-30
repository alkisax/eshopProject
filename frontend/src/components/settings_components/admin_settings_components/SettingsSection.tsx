// frontend\src\components\settings_components\admin_settings_components\SettingsSection.tsx
// αυτό το αρχείο είναι ένα βοηθητικό ui componente που θα μας βοηθήσει να γίνουν colapsable όλα τα σχετικό υπομέρη του settings admin pannel
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Props = {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
};

const SettingsSection = ({
  title,
  defaultExpanded = false,
  children,
}: Props) => {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>

      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

export default SettingsSection;
