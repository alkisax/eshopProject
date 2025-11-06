import { Skeleton, Box, Divider, List, ListItem, Stack } from '@mui/material'

const StoreSidebarSkeleton = () => {
  return (
    <Box sx={{ width: 240, p: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 3, mt: 7 }} /> {/* Search */}
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 3 }} />       {/* Semantic Search */}

      <Divider sx={{ mb: 2 }} />
      <Skeleton variant="text" width="50%" height={28} sx={{ mb: 1 }} /> {/* Categories title */}

      <List dense disablePadding>
        <Stack spacing={1}>
          {[...Array(6)].map((_, i) => (
            <ListItem key={i} disablePadding>
              <Skeleton variant="rectangular" width="90%" height={32} sx={{ borderRadius: 1 }} />
            </ListItem>
          ))}
        </Stack>
      </List>

      <Divider sx={{ mt: 3, mb: 2 }} />

      <Stack spacing={1}>
        <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 2 }} /> {/* Apply */}
        <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 2 }} /> {/* Clear */}
      </Stack>
    </Box>
  )
}

export default StoreSidebarSkeleton
