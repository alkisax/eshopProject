// frontend\src\components\store_components\CommodityPageMobile.tsx
import { Box } from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import GalleryCommodityPageSkeleton from "../skeletons/GalleryCommodityPageSkeleton";
import GalleryCommodityPage from "./GalleryCommodityPage";
import ItemTitlePrice from "./commodity_page_components/ItemTitlePrice";
import ItemActionsBtns from "./commodity_page_components/ItemActionsBtns";
import ItemDescription from "./commodity_page_components/ItemDescription";
import ItemSuggestions from "./commodity_page_components/ItemSuggestions";
import ReviewsSection from "./commodity_page_components/ItemReviews";
import type { CommodityType } from "../../types/commerce.types";
import type { IUser } from "../../types/types";
import type { CommentType } from "../../types/commerce.types";
import VariantSelector from "./commodity_page_components/VariantSelector";

interface CommodityPageMobileProps {
  commodity: CommodityType;
  user: IUser | null;
  isFavorite: boolean;
  showSuggestions: boolean;
  suggested: CommodityType[];
  comments: CommentType[];
  newComment: string;
  newRating: number | null;
  onAddToCart: (commodityId: string, variantId?: string) => void;
  onToggleFavorite: () => void;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  setNewRating: React.Dispatch<React.SetStateAction<number | null>>;
  commentPage: number;
  setCommentPage: React.Dispatch<React.SetStateAction<number>>;
  commentsPerPage: number;
  handleAddComment: () => Promise<void>;
}

const CommodityPageMobile = ({
  commodity,
  user,
  isFavorite,
  showSuggestions,
  suggested,
  comments,
  newComment,
  newRating,
  onAddToCart,
  onToggleFavorite,
  setShowSuggestions,
  setNewComment,
  setNewRating,
  commentPage,
  setCommentPage,
  commentsPerPage,
  handleAddComment,
}: CommodityPageMobileProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  useEffect(() => {
    setSelectedVariantId(null);
  }, [commodity._id]);

  return (
    <>
      <Helmet>
        <title>{`${commodity.name} | Έχω μια Ιδέα`}</title>
      </Helmet>

      {/* NO TopCategoryGridHeader */}

      <Box sx={{ px: 2, py: 2 }}>
        {/* GALLERY */}
        <Suspense fallback={<GalleryCommodityPageSkeleton />}>
          <GalleryCommodityPage commodity={commodity} />
        </Suspense>

        {/* TITLE + PRICE */}
        <Box sx={{ mt: 3 }}>
          <ItemTitlePrice commodity={commodity} />
        </Box>

        {/* variants */}
        {commodity.variants && commodity.variants.length > 0 && (
          <VariantSelector
            variants={commodity.variants}
            value={selectedVariantId}
            onChange={setSelectedVariantId}
          />
        )}

        {/* DESCRIPTION */}
        <Box sx={{ mt: 4 }}>
          <ItemDescription commodity={commodity} />
        </Box>

        {/* BUTTONS */}
        <Box sx={{ mt: 3 }}>
          <ItemActionsBtns
            stock={commodity.stock}
            userExists={!!user}
            isFavorite={isFavorite}
            hasVariants={!!commodity.variants?.length}
            variantSelected={!!selectedVariantId}
            onAddToCart={() =>
              onAddToCart(commodity._id, selectedVariantId ?? undefined)
            }
            onToggleFavorite={onToggleFavorite}
            showSuggestions={showSuggestions}
            onToggleSuggestions={() => setShowSuggestions((prev) => !prev)}
          />
        </Box>

        {/* SUGGESTIONS */}
        {showSuggestions && (
          <ItemSuggestions suggestions={suggested} currentId={commodity._id} />
        )}

        {/* REVIEWS */}
        <Box sx={{ mt: 4 }}>
          <ReviewsSection
            user={user}
            comments={comments}
            newComment={newComment}
            newRating={newRating}
            setNewComment={setNewComment}
            setNewRating={setNewRating}
            handleAddComment={handleAddComment}
            commentPage={commentPage}
            setCommentPage={setCommentPage}
            commentsPerPage={commentsPerPage}
          />
        </Box>
      </Box>
    </>
  );
};

export default CommodityPageMobile;
