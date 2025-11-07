// frontend\src\components\skeletons\GalleryCommodityPageSkeleton.tsx

import { Box, Skeleton, Stack } from '@mui/material'

const GalleryCommodityPageSkeleton = () => {
  return (
    <Box sx={{ mt: 4, width: '100%' }}>
      <Stack spacing={3}>
        {/* Title placeholder */}
        <Skeleton variant="text" width="40%" height={48} />

        {/* Same flex proportions as real gallery */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            maxWidth: 700,
            width: '100%',
          }}
        >
          {/* === Main image skeleton === */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height={400}
              sx={{
                borderRadius: 2,
                bgcolor: '#f0f0f0',
              }}
            />
          </Box>

          {/* === Thumbnails === */}
          <Stack
            spacing={1}
            sx={{
              flexShrink: 0,
              width: 80,
              alignItems: 'center',
            }}
          >
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={80}
                height={80}
                sx={{
                  borderRadius: 1,
                  bgcolor: '#e0e0e0',
                }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default GalleryCommodityPageSkeleton
