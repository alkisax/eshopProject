import { Card, CardContent, Skeleton, Stack } from '@mui/material'

const LastAnnouncementSkeleton = () => {
  return (
    <Card
      id="last-announcement-skeleton"
      sx={{
        mt: 4,
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width="40%" height={24} />
        </Stack>
      </CardContent>
    </Card>
  )
}

export default LastAnnouncementSkeleton
