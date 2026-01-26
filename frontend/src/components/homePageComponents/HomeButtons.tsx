// frontend\src\components\homePageComponents\HomeButtons.tsx
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BlogHome from "../../blog/blogPages/BlogHome";
import { useSettings } from "../../context/SettingsContext";

const HomeButtons = () => {
  const navigate = useNavigate();

  const { settings } = useSettings();
  const storeBtnBg = settings?.theme?.btnImage1;
  return (
    <>
      <Stack
        direction="column"
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 4, mb: 4 }}
      >
        <Button
          id="store-btn"
          variant="contained"
          size="large"
          onClick={() => navigate("/store")}
          sx={{
            px: 5,
            py: 2,
            fontWeight: "bold",
            fontSize: "1.1rem",
            borderRadius: 3,
            color: "#f9f9f9",
            textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
            width: "100%",
            maxWidth: 280,
            backgroundImage: `url("${storeBtnBg}")`,

            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
            "&:hover": {
              opacity: 0.9,
              boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
            },
          }}
        >
          Κατάστημα
        </Button>
        <BlogHome />
      </Stack>
    </>
  );
};

export default HomeButtons;
