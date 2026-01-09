// frontend/themeB/ProductGridWrapper.tsx

import React, {
  type ReactElement,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react';
import axios from 'axios';

import type { CommodityType } from '../../src/types/commerce.types';
import { VariablesContext } from '../../src/context/VariablesContext';

interface Props {
  searchQuery?: string;
  sortCriteria?: 'price-asc' | 'price-desc' | 'popularity';
  category?: string;
  page?: number;
  limit?: number;
  children:
    | ReactElement<{ commodities: CommodityType[] }>
    | ReactElement<{ commodities: CommodityType[] }>[];
}

// Wrapper που φέρνει commodities από backend
// ⚠️ Χρησιμοποιείται ΠΡΟΣ ΤΟ ΠΑΡΟΝ μόνο για landing page
// (latest / active products, server-side sorting & filtering)
const ProductGridWrapper = ({
  searchQuery,
  sortCriteria,
  category,
  page,
  limit,
  children,
}: Props) => {
  const [commodities, setCommodities] = useState<CommodityType[]>([]);
  const { url } = useContext(VariablesContext);

  const fetchCommodities = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/commodity/search`, {
        params: {
          page: page ?? 1,
          limit: limit ?? 6,
          search: searchQuery,
          category,
          sort: sortCriteria,
          // includeInactive ΔΕΝ το στέλνουμε → default false
        },
      });

      // backend shape:
      // { data: { items, totalItems, totalPages, currentPage } }
      const items: CommodityType[] = response.data?.data?.items ?? [];

      setCommodities(items);
    } catch (err) {
      console.error('Failed to fetch commodities for landing', err);
      setCommodities([]);
    }
  }, [url, searchQuery, sortCriteria, category, page, limit]);

  useEffect(() => {
    fetchCommodities();
  }, [fetchCommodities]);

  // περνάμε τα commodities στα children (UI-only components)
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { commodities });
    }
    return null;
  });

  return <>{childrenWithProps}</>;
};

export default ProductGridWrapper;
