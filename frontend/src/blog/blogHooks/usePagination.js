// src/hooks/usePagination.js
import { useState, useMemo } from "react";

export const usePagination = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pageCount = useMemo(() => Math.ceil(items.length / itemsPerPage), [items, itemsPerPage]);

  const currentItems = useMemo(() => {
    const offset = currentPage * itemsPerPage;
    return items.slice(offset, offset + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pageCount) {
      setCurrentPage(pageIndex);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return {
    currentPage,
    pageCount,
    currentItems,
    goToPage,
    handlePageClick,
  };
};
