// frontend\src\components\store_components\GalleryCommodityPage.tsx\

import { Box, Stack, Typography } from "@mui/material"
import { useState, useEffect } from 'react'
import type { CommodityType } from '../../types/commerce.types'

interface Props {
  commodity: CommodityType
}

const GalleryCommodityPage = ({ commodity }: Props) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (commodity.images?.length) {
      setSelectedImage(commodity.images[0])
    }
  }, [commodity.images])

  return (
    <Box sx={{ mt: 4 }}>
      <Stack spacing={3}>
        {/* === Title === */}
        <Typography variant="h4" component="h1" gutterBottom>
          {commodity.name}
        </Typography>

        {/* === Image gallery === */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Main image */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={selectedImage || '/placeholder.jpg'}
              alt={commodity.name || 'No image'}
              title={commodity.name || 'No image'}
              loading="lazy"
              style={{
                width: '100%',
                maxHeight: 400,
                borderRadius: 8,
                objectFit: 'contain',
                backgroundColor: '#fafafa',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.jpg'
              }}
            />
          </Box>

          {/* Thumbnails */}
          {(commodity.images?.length ?? 0) > 1 && (
            <Stack spacing={1}>
              {commodity.images!.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  title={`thumb-${idx}`}
                  loading="lazy"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 4,
                    cursor: 'pointer',
                    border:
                      img === selectedImage
                        ? '2px solid #1976d2'
                        : '1px solid #ccc',
                  }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

export default GalleryCommodityPage