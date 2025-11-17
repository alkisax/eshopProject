import { Box } from "@mui/material";
import { useRef, useLayoutEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

const CrossLayout = ({ children }: Props) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    if (innerRef.current) {
      setContentHeight(innerRef.current.getBoundingClientRect().height);
    }
  }, [children]);

  const extend = 20;      // οριζόντια προέκταση
  const vExtend = 120;    // κάθετη προέκταση (πιο μεγάλη)
  const bottomAreaHeight = 700;
  const fullHeight = contentHeight + bottomAreaHeight;

  return (
    <Box
      sx={{
        width: `calc(100vw - ${extend * 2}px)`,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* MAIN ROW */}
      <Box sx={{ display: "flex" }}>
        {/* LEFT CONTENT AREA */}
        <Box sx={{ width: "60%", pl: `${extend}px` }}>
          <Box ref={innerRef} sx={{ maxWidth: "600px" }}>
            {children}
          </Box>
        </Box>

        {/* RIGHT EMPTY AREA */}
        <Box sx={{ width: "40%", height: contentHeight }} />
      </Box>

      {/* LEFT VERTICAL LINE */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: `${extend}px`,
          width: "3px",
          height: fullHeight,
          backgroundColor: "#008482",

          "&::before": {
            content: '""',
            position: "absolute",
            top: `-${vExtend}px`,
            left: 0,
            width: "3px",
            height: `${vExtend}px`,
            backgroundColor: "#008482",
          },

          "&::after": {
            content: '""',
            position: "absolute",
            bottom: `-${vExtend}px`,
            left: 0,
            width: "3px",
            height: `${vExtend}px`,
            backgroundColor: "#008482",
          },
        }}
      />

      {/* CENTER VERTICAL LINE */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: `calc(60% + ${extend}px)`,
          width: "3px",
          height: fullHeight,
          backgroundColor: "#008482",

          "&::before": {
            content: '""',
            position: "absolute",
            top: `-${vExtend}px`,
            left: 0,
            width: "3px",
            height: `${vExtend}px`,
            backgroundColor: "#008482",
          },

          "&::after": {
            content: '""',
            position: "absolute",
            bottom: `-${vExtend}px`,
            left: 0,
            width: "3px",
            height: `${vExtend}px`,
            backgroundColor: "#008482",
          },
        }}
      />

      {/* RIGHT VERTICAL LINE */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: `${extend}px`,
          width: "3px",
          height: fullHeight,
          backgroundColor: "#008482",

          "&::before": {
            content: '""',
            position: "absolute",
            top: `-${vExtend}px`,
            left: 0,
            width: "3px",
            height: `${vExtend}px`,
            backgroundColor: "#008482",
          },

          "&::after": {
            content: '""',
            position: "absolute",
            bottom: `-${vExtend}px`,
            left: 0,
            width: "3px",
            height: `${vExtend}px`,
            backgroundColor: "#008482",
          },
        }}
      />

{/* TOP HORIZONTAL LINE */}
<Box
  sx={{
    position: "absolute",
    top: 50,          // ★ κατεβάζει τη γραμμή κάτω από το navbar
    left: 0,
    width: "100%",
    height: "3px",
    backgroundColor: "#008482",

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: `-${extend}px`,
      width: `${extend}px`,
      height: "3px",
      backgroundColor: "#008482",
    },

    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: `-${extend}px`,
      width: `${extend}px`,
      height: "3px",
      backgroundColor: "#008482",
    },
  }}
/>

      {/* CENTER HORIZONTAL LINE */}
      <Box
        sx={{
          position: "absolute",
          top: contentHeight,
          left: 0,
          width: "100%",
          height: "3px",
          backgroundColor: "#008482",

          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: `-${extend}px`,
            width: `${extend}px`,
            height: "3px",
            backgroundColor: "#008482",
          },

          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: `-${extend}px`,
            width: `${extend}px`,
            height: "3px",
            backgroundColor: "#008482",
          },
        }}
      />

      {/* BOTTOM HORIZONTAL LINE */}
      <Box
        sx={{
          position: "absolute",
          top: fullHeight - 60,
          left: 0,
          width: "100%",
          height: "3px",
          backgroundColor: "#008482",

          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: `-${extend}px`,
            width: `${extend}px`,
            height: "3px",
            backgroundColor: "#008482",
          },

          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: `-${extend}px`,
            width: `${extend}px`,
            height: "3px",
            backgroundColor: "#008482",
          },
        }}
      />

      {/* Bottom empty area */}
      <Box sx={{ width: "100%", height: bottomAreaHeight }} />
    </Box>
  );
};

export default CrossLayout;
