// frontend/themeB/hooks/useCategoryPreview.ts
import { useEffect, useState } from "react";
import axios from "axios";
// import type { CommodityType } from "../src/types/commerce.types";

export const useCategoryPreview = (url: string, category: string) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await axios.get(`${url}/api/commodity/search`, {
          params: {
            page: 1,
            limit: 6,
            categories: category,
          },
        });

        const items = res.data?.data?.items ?? [];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        setImage(randomItem?.images?.[0] ?? null);
      } catch {
        setImage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url, category]);

  return { image, loading };
};
