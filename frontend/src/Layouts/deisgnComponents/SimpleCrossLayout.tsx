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

  const bottomAreaHeight = 700;

  return (
    <Box sx={{ width: "100vw", position: "relative" }}>
      
      {/* FLEX ROW */}
      <Box sx={{ display: "flex", width: "100vw" }}>

        {/* LEFT SIDE (60vw) */}
        <Box
          sx={{
            width: "60vw",
            px: "40px",  // padding in wrapper, not in measured box
            boxSizing: "border-box",
          }}
        >
          <Box
            ref={innerRef} // measure ONLY the content
            sx={{
              maxWidth: "600px", 
              width: "100%",
            }}
          >
            {children}
          </Box>
        </Box>

        {/* RIGHT EMPTY AREA — same height as content */}
        <Box sx={{ width: "40vw", height: contentHeight }} />
      </Box>

      {/* ★ VERTICAL LINE — starts at top, ends after bottom block */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "60vw",
          width: "4px",
          height: contentHeight + bottomAreaHeight + "px",
          backgroundColor: "#008482",
        }}
      />

      {/* ★ HORIZONTAL LINE — starts EXACTLY at end of content */}
      <Box
        sx={{
          position: "absolute",
          top: contentHeight,
          left: 0,
          width: "100vw",
          height: "4px",
          backgroundColor: "#008482",
        }}
      />

      {/* BOTTOM AREA */}
      <Box sx={{ width: "100vw", height: bottomAreaHeight }} />
    </Box>
  );
};

export default CrossLayout;
