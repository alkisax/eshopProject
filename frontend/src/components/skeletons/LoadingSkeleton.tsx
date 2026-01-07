import { Box, Skeleton, Stack } from '@mui/material'

const LoadingSkeleton = () => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        px: 2,
        py: 4,
      }}
    >
      <Stack spacing={2}>
        {/* title */}
        <Skeleton variant='text' width='40%' height={32} />

        {/* subtitle / meta */}
        <Skeleton variant='text' width='25%' height={20} />

        {/* main content blocks */}
        <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  )
}

export default LoadingSkeleton
