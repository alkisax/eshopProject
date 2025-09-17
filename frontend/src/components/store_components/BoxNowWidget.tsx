// TODO αυτο δεν είναι ολοκληρωμένο

import { useEffect } from "react";
import { Box } from "@mui/material";

interface BoxNowLocker {
  boxnowLockerId: string;
  boxnowLockerAddressLine1: string;
  boxnowLockerPostalCode: string;
  boxnowLockerName?: string;
  boxnowLockerCity?: string;
  boxnowLockerRegion?: string;
  boxnowLockerCountry?: string;
}

// 👇 Δηλώνουμε global type για window ώστε να μην χρειάζεται "as any"
declare global {
  interface Window {
    _bn_map_widget_config?: {
      partnerId: number;
      parentElement: string;
      type?: "iframe" | "popup" | "navigate";
      afterSelect: (selected: BoxNowLocker) => void;
    };
  }
}

interface BoxNowWidgetProps {
  partnerId: number;
  onSelect: (locker: BoxNowLocker) => void;
}

const BoxNowWidget = ({ partnerId, onSelect }: BoxNowWidgetProps) => {
  useEffect(() => {
    window._bn_map_widget_config = {
      partnerId,
      parentElement: "#boxnowmap",
      type: "iframe",
      afterSelect: (selected: BoxNowLocker) => {
        onSelect(selected);
      },
    };

    const script = document.createElement("script");
    script.src = "https://widget-cdn.boxnow.gr/map-widget/client/v5.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [partnerId, onSelect]);

  return (
    <Box
      id="boxnowmap"
      sx={{
        width: "100%",
        minHeight: { xs: 400, sm: 500 },
        border: "1px solid #ddd",
        borderRadius: 2,
      }}
    />
  );
};

export default BoxNowWidget;
