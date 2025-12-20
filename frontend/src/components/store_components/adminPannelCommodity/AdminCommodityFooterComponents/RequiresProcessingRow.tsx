// frontend\src\components\store_components\adminPannelCommodity\AdminCommodityFooterComponents\RequiresProcessingRow.tsx
import { Stack, Switch, FormControlLabel, TextField } from "@mui/material";

interface Props {
  requiresProcessing: boolean;
  processingTimeDays?: number;
  onChange: (data: {
    requiresProcessing: boolean;
    processingTimeDays?: number;
  }) => void;
}

const AdminRequiresProcessingRow = ({
  requiresProcessing,
  processingTimeDays,
  onChange,
}: Props) => {
  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Switch
            checked={requiresProcessing}
            onChange={(e) =>
              onChange({
                requiresProcessing: e.target.checked,
                processingTimeDays: e.target.checked
                  ? processingTimeDays ?? 0
                  : undefined,
              })
            }
            color="warning"
          />
        }
        label="Requires processing (not immediately available)"
      />

      {requiresProcessing && (
        <TextField
          label="Processing time (days)"
          type="number"
          value={processingTimeDays ?? 0}
          onChange={(e) =>
            onChange({
              requiresProcessing: true,
              processingTimeDays: Number(e.target.value),
            })
          }
          slotProps={{
            htmlInput: { min: 0 },
          }}
          size="small"
        />
      )}
    </Stack>
  );
};

export default AdminRequiresProcessingRow;
