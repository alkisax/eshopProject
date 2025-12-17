import { Box, Button, TextField, Stack, Switch, Typography } from '@mui/material';
import type { CommodityVariantType } from '../../../../types/commerce.types';

interface Props {
  variants: CommodityVariantType[];
  onChange: (variants: CommodityVariantType[]) => void;
}

const AdminVariantsEditor = ({ variants, onChange }: Props) => {

  const updateAttribute = (
    variantIdx: number,
    attrKey: string,
    value: string
  ) => {
    const copy = structuredClone(variants);
    copy[variantIdx].attributes[attrKey] = value;
    onChange(copy);
  };

  const removeAttribute = (variantIdx: number, attrKey: string) => {
    const copy = structuredClone(variants);
    delete copy[variantIdx].attributes[attrKey];
    onChange(copy);
  };

  const addAttribute = (variantIdx: number) => {
    const copy = structuredClone(variants);
    copy[variantIdx].attributes['new'] = '';
    onChange(copy);
  };

  const addVariant = () => {
    onChange([
      ...variants,
      {
        attributes: {},
        active: true,
      },
    ]);
  };

  const removeVariant = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1">Variants</Typography>

      {variants.map((variant, vIdx) => (
        <Box key={variant._id} sx={{ border: '1px solid #ddd', p: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Variant #{vIdx + 1}
          </Typography>

          {Object.entries(variant.attributes).map(([key, value]) => (
            <Stack direction="row" spacing={1} key={key} sx={{ mb: 1 }}>
              <TextField
                size="small"
                label="Attribute"
                value={key}
                disabled
              />
              <TextField
                size="small"
                label="Value"
                value={value}
                onChange={(e) =>
                  updateAttribute(vIdx, key, e.target.value)
                }
              />
              <Button
                color="error"
                onClick={() => removeAttribute(vIdx, key)}
              >
                ✕
              </Button>
            </Stack>
          ))}

          <Button
            size="small"
            onClick={() => addAttribute(vIdx)}
          >
            + Add Attribute
          </Button>

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Switch
              checked={variant.active}
              onChange={(e) => {
                const copy = structuredClone(variants);
                copy[vIdx].active = e.target.checked;
                onChange(copy);
              }}
            />
            <Button color="error" onClick={() => removeVariant(vIdx)}>
              Remove Variant
            </Button>
          </Stack>
        </Box>
      ))}

      <Button variant="outlined" onClick={addVariant}>
        Add Variant
      </Button>
    </Box>
  );
};

export default AdminVariantsEditor