// src/components/store_components/commodity_page_components/VariantAttributeSelector.tsx
import { Box, Typography, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { CommodityVariantType } from '../../../types/commerce.types';
import { useMemo } from 'react';

interface Props {
  variants: CommodityVariantType[];
  value: string | null;
  onChange: (variantId: string | null) => void;
}

const VariantAttributeSelector = ({ variants, value, onChange }: Props) => {
  const activeVariants = variants.filter(v => v.active !== false);

  // 1️⃣ collect attributes → { size: ['S','M'], color:['red','blue'] }
  const attributesMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};

    activeVariants.forEach(v => {
      Object.entries(v.attributes).forEach(([key, val]) => {
        if (!map[key]) map[key] = new Set();
        map[key].add(val);
      });
    });

    return Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, Array.from(v)])
    );
  }, [activeVariants]);

  // 2️⃣ selected attributes derived from selected variant
  const selectedAttributes = useMemo(() => {
    if (!value) return {};
    const found = activeVariants.find(v => v._id === value);
    return found?.attributes ?? {};
  }, [value, activeVariants]);

  // 3️⃣ όταν αλλάζει attribute → βρίσκουμε matching variant
  const handleAttributeChange =
    (attrKey: string) => (e: SelectChangeEvent<string>) => {
      const nextAttributes = {
        ...selectedAttributes,
        [attrKey]: e.target.value,
      };

      const match = activeVariants.find(v =>
        Object.entries(nextAttributes).every(
          ([k, val]) => v.attributes[k] === val
        )
      );

      onChange(match?._id ?? null);
    };

  if (activeVariants.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant='body2' sx={{ mb: 1 }}>
        Επιλογή παραλλαγής
      </Typography>

      {Object.entries(attributesMap).map(([attrKey, values]) => (
        <Box key={attrKey} sx={{ mb: 1 }}>
          <Typography variant='caption' sx={{ mb: 0.5, display: 'block' }}>
            {attrKey}
          </Typography>

          <Select
            fullWidth
            value={selectedAttributes[attrKey] ?? ''}
            onChange={handleAttributeChange(attrKey)}
            displayEmpty
          >
            <MenuItem value='' disabled>
              Επιλέξτε {attrKey}
            </MenuItem>

            {values.map(v => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ))}
    </Box>
  );
};

export default VariantAttributeSelector;
