import { Box, Skeleton, Stack, Paper } from '@mui/material'

const CommodityPageSkeleton = () => {
  return (
    <Box sx={{ mt: 4, px: { xs: 2, sm: 4 } }}>
      <Stack spacing={3}>
        {/* === Title === */}
        <Skeleton variant="text" width="50%" height={48} />

        {/* === Gallery === */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Main image */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ borderRadius: 2, flex: 1 }}
          />
          {/* Thumbnails */}
          <Stack spacing={1} sx={{ flexShrink: 0 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={80}
                height={80}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>
        </Box>

        {/* === Price === */}
        <Skeleton variant="text" width="20%" height={32} />

        {/* === Description === */}
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />

        {/* === Buttons === */}
        <Box>
          <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1, mb: 1 }} />
          <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1, mb: 1 }} />
          <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
        </Box>

        {/* === Suggested items === */}
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[...Array(2)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={180}
                height={180}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        </Paper>

        {/* === Reviews === */}
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
          {[...Array(2)].map((_, i) => (
            <Box key={i} sx={{ mt: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="90%" />
            </Box>
          ))}
        </Paper>
      </Stack>
    </Box>
  )
}

export default CommodityPageSkeleton
