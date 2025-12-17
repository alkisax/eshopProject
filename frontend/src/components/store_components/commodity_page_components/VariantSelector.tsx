import { Box, Typography, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { CommodityVariantType } from '../../../types/commerce.types';

interface Props {
  variants: CommodityVariantType[];
  value: string | null;
  onChange: (variantId: string | null) => void;
}

const VariantSelector = ({ variants, value, onChange }: Props) => {
  const activeVariants = variants.filter(v => v.active !== false);

  if (activeVariants.length === 0) {
    return null;
  }

  const handleChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    onChange(val === '' ? null : val);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant='body2' sx={{ mb: 1 }}>
        Επιλογή
      </Typography>

      <Select
        fullWidth
        value={value ?? ''}
        onChange={handleChange}
        displayEmpty
      >
        <MenuItem value='' disabled>
          Επιλέξτε
        </MenuItem>

        {activeVariants.map((variant) => (
          <MenuItem key={variant._id} value={variant._id}>
            {Object.values(variant.attributes).join(' / ')}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default VariantSelector;
