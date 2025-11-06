import { Box, Skeleton } from '@mui/material'

const LatestCommoditiesSkeleton = () => {
  return (
      <Box
        id="home-carousel-skeleton"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            width: { xs: '80%', md: '50%' },
            height: { xs: 220, md: 240 },
            mx: 'auto',
            borderRadius: 2,
          }}
        />
        <Skeleton width="40%" height={28} sx={{ mt: 2 }} />
        <Skeleton width="25%" height={20} />
    </Box>
  )
}

export default LatestCommoditiesSkeleton
