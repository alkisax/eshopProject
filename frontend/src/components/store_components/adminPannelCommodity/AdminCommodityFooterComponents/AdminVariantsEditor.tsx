// frontend\src\components\store_components\adminPannelCommodity\AdminCommodityFooterComponents\AdminVariantsEditor.tsx
import {
  Box,
  Button,
  TextField,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import type { CommodityVariantType } from "../../../../types/commerce.types";

/**
 * Admin-only editable attribute model
 */
type EditableAttribute = {
  key: string;
  value: string;
};

export type EditableVariant = Omit<CommodityVariantType, "attributes"> & {
  attributes: EditableAttribute[];
};

interface Props {
  variants: EditableVariant[];
  onChange: (variants: EditableVariant[]) => void;
}

const AdminVariantsEditor = ({ variants, onChange }: Props) => {
  const updateAttributeKey = (
    variantIdx: number,
    attrIdx: number,
    value: string
  ) => {
    const copy = structuredClone(variants);
    copy[variantIdx].attributes[attrIdx].key = value;
    onChange(copy);
  };

  const updateAttributeValue = (
    variantIdx: number,
    attrIdx: number,
    value: string
  ) => {
    const copy = structuredClone(variants);
    copy[variantIdx].attributes[attrIdx].value = value;
    onChange(copy);
  };

  const addAttribute = (variantIdx: number) => {
    const copy = structuredClone(variants);
    copy[variantIdx].attributes.push({ key: "", value: "" });
    onChange(copy);
  };

  const removeAttribute = (variantIdx: number, attrIdx: number) => {
    const copy = structuredClone(variants);
    copy[variantIdx].attributes.splice(attrIdx, 1);
    onChange(copy);
  };

  const addVariant = () => {
    onChange([
      ...variants,
      {
        _id: crypto.randomUUID(),
        active: true,
        attributes: [],
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
        <Box key={variant._id} sx={{ border: "1px solid #ddd", p: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Variant #{vIdx + 1}
          </Typography>

          {variant.attributes.map((attr, aIdx) => (
            <Stack direction="row" spacing={1} key={aIdx} sx={{ mb: 1 }}>
              <TextField
                size="small"
                label="Attribute"
                value={attr.key}
                onChange={(e) => updateAttributeKey(vIdx, aIdx, e.target.value)}
              />

              <TextField
                size="small"
                label="Value"
                value={attr.value}
                onChange={(e) =>
                  updateAttributeValue(vIdx, aIdx, e.target.value)
                }
              />

              <Button color="error" onClick={() => removeAttribute(vIdx, aIdx)}>
                ✕
              </Button>
            </Stack>
          ))}

          <Button size="small" onClick={() => addAttribute(vIdx)}>
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

export default AdminVariantsEditor;
