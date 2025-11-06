import { Card, CardContent, CardActions, Skeleton, Grid, Box } from '@mui/material'

const StoreItemListSkeleton = () => {
  const skeletonItems = Array.from({ length: 6 }); // show 6 placeholder cards

  return (
    <Box>
      <Grid container spacing={3}>
        {skeletonItems.map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              {/* Image skeleton */}
              <Skeleton
                variant="rectangular"
                height={160}
                sx={{ borderRadius: '12px 12px 0 0' }}
              />

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}
              >
                {/* Title */}
                <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
                {/* Price */}
                <Skeleton variant="text" width="40%" height={22} />
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                {/* Add button */}
                <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 2 }} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default StoreItemListSkeleton
