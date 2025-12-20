// frontend\src\utils\confirmRequiresProcessing.ts
import type { CommodityType } from "../types/commerce.types";

export const confirmRequiresProcessing = (
  commodity: CommodityType
): boolean => {
  if (!commodity.requiresProcessing) return true;

  const days = commodity.processingTimeDays ?? 0;

  return window.confirm(
    `⚠️ Αυτό το προϊόν απαιτεί επεξεργασία${
      days ? ` (${days} ημέρες)` : ""
    }.\nΘέλεις να συνεχίσεις;`
  );
};
