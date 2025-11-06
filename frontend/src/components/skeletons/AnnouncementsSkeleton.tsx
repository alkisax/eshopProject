// src/components/skeletons/AnnouncementsSkeleton.tsx
import { Box, Card, CardContent, Skeleton, Grid, Typography } from '@mui/material'

const AnnouncementsSkeleton = () => {
  return (
    <Box p={4} maxWidth="lg" mx="auto">
      {/* Page title */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        fontWeight="bold"
      >
        Ανακοινώσεις
      </Typography>

      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent>
                {/* Title */}
                <Skeleton
                  variant="text"
                  width="70%"
                  height={28}
                  sx={{ mb: 1 }}
                />

                {/* Preview content */}
                <Skeleton
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 2, mb: 2 }}
                />

                {/* Date */}
                <Skeleton
                  variant="text"
                  width="50%"
                  height={18}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default AnnouncementsSkeleton
