import { Box, Container, Paper, Skeleton, Stack } from '@mui/material'

const BlogPostSkeleton = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
        }}
      >
        <Stack spacing={2} alignItems="center">
          {/* Title */}
          <Skeleton variant="text" width="70%" height={40} />

          {/* Date */}
          <Skeleton variant="text" width="30%" height={20} />

          {/* Content blocks */}
          <Box sx={{ width: '100%', mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 2, mb: 2 }}
              />
            ))}
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}

export default BlogPostSkeleton
