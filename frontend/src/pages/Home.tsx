import { Box, Button, Container, Typography, Stack, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          background: "linear-gradient(135deg, #e0e0e0, #fafafa)",
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
          ✨ Welcome to the Metaphysics Shop ✨
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Explore mystical tools, ancient wisdom, and the latest updates from our metaphysical world.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/store")}
          >
            🛍 Go to Store
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => navigate("/news")}
          >
            📰 News
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => navigate("/announcements")}
          >
            📢 Announcements
          </Button>
        </Stack>
      </Paper>

      {/* Info Section */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          🔮 What you’ll find here:
        </Typography>
        <Typography variant="body1" paragraph>
          Our store offers mystical products, spiritual artifacts, and esoteric knowledge to aid your journey.
        </Typography>
        <Typography variant="body1" paragraph>
          Stay tuned with our <strong>News</strong> page for articles, insights, and guides — and check
          <strong> Announcements</strong> for special events and offers.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
