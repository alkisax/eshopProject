// frontend\src\components\store_components\CommodityPage.tsx
import { useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Typography, Box } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import { TextField, Rating, Pagination } from "@mui/material";
import { UserAuthContext } from "../../context/UserAuthContext";
import type { CommodityType } from "../../types/commerce.types";
import { VariablesContext } from "../../context/VariablesContext";
import { CartActionsContext } from "../../context/CartActionsContext";
// import type { IUser } from "../../types/types";
// import type { Types } from "mongoose";
import { Helmet } from "react-helmet-async";
import { AiModerationContext } from "../../context/AiModerationContext";
import { useAnalytics } from "@keiko-app/react-google-analytics"; // GA
import CommodityPageSkeleton from "../skeletons/CommodityPageSkeleton";
import { Suspense, lazy } from "react";
import GalleryCommodityPageSkeleton from "../skeletons/GalleryCommodityPageSkeleton";
import TopCategoryGridHeader from "../../Layouts/deisgnComponents/TopCategoryGridHeader";
import ItemDescription from "./commodity_page_components/ItemDescription";
import ItemTitlePrice from "./commodity_page_components/ItemTitlePrice";
import ItemActionsBtns from "./commodity_page_components/ItemActionsBtns";
import ItemSuggestions from "./commodity_page_components/ItemSuggestions";
import ReviewSection from "./commodity_page_components/ItemReviews";
import CommodityPageMobile from "./CommodityPageMobile";

import { useRef, useLayoutEffect } from "react";
// import VariantSelector from "./commodity_page_components/VariantSelector";
import VariantAttributeSelector from "./commodity_page_components/VariantAttributeSelector";
import { confirmRequiresProcessing } from "../../utils/confirmRequiresProcessing";

/* suspence
React.lazy() is a built-in React function that allows you to dynamically import a component only when it’s needed. Normally, when you do: 
import GalleryCommodityPage from '../store_components/GalleryCommodityPage'
That file is eagerly loaded — bundled together with your main app.
With React.lazy:
const GalleryCommodityPage = lazy(() => import('../store_components/GalleryCommodityPage'))
React will not load that file until this component is actually rendered for the first time.
That means smaller initial bundle, faster page load.
*/
const GalleryCommodityPage = lazy(
  () => import("../store_components/GalleryCommodityPage")
);

const CommodityPage = () => {
  const { url, setHasFavorites } = useContext(VariablesContext);
  const { addOneToCart } = useContext(CartActionsContext)!;
  const { aiModerationEnabled } = useContext(AiModerationContext);

  const [commodity, setCommodity] = useState<CommodityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false); //προστέθηκε αυτό για να μην κάνει autoload το suggestion και μου ΄καίει' τα λεφτα στο openAI api
  const [suggested, setSuggested] = useState<CommodityType[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const commentsPerPage = 3;

  const comments = (commodity?.comments ?? []).filter((c) => c.isApproved);

  const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const { user } = useContext(UserAuthContext);

  const { tracker } = useAnalytics() || {}; //GA

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // GA google analitics - track specific view of item
  useEffect(() => {
    console.log(
      "useEffect triggered, commodity:",
      commodity,
      "tracker:",
      tracker
    );
    if (commodity && tracker?.trackEvent) {
      tracker.trackEvent("view_item", {
        currency: commodity.currency,
        value: commodity.price,
        items: [
          {
            item_id: commodity._id,
            item_name: commodity.name,
            price: commodity.price,
            quantity: 1,
          },
        ],
      });
      console.log("GA event sent: view_item", commodity.name, commodity._id);
    }
  }, [commodity, tracker]);

  const fetchCommodity = useCallback(async () => {
    if (!slugOrId) return;
    try {
      const endpoint = isObjectId(slugOrId)
        ? `${url}/api/commodity/${slugOrId}`
        : `${url}/api/commodity/slug/${slugOrId}`;

      const res = await axios.get(endpoint);
      setCommodity(res.data.data);

      // 👇 set first image as selected
      if (res.data.data.images?.length > 0) {
        setSelectedImage(res.data.data.images[0]);
      }
    } catch (err) {
      setError("Failed to load commodity.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slugOrId, url]);

  useEffect(() => {
    if (slugOrId) fetchCommodity();
  }, [slugOrId, fetchCommodity]);

  const id = commodity?._id;

  // reset το variant όταν αλλάζει προϊόν:
  useEffect(() => {
    setSelectedVariantId(null);
  }, [id]);

  const handleAddComment = async () => {
    if (!id || !user) return;
    try {
      const token = localStorage.getItem("token");

      let approvedFlag = true;

      // ✅ If AI moderation is active, pre-check comment
      if (aiModerationEnabled) {
        const modRes = await axios.post(
          `${url}/api/moderationAi`,
          { commentToCheck: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("modRes.data.data", modRes.data.data);

        // If flagged, store as unapproved
        if (modRes.data.data === false) {
          approvedFlag = false;
        }
      }

      // always save the comment to DB
      await axios.post(
        `${url}/api/commodity/${id}/comments`,
        {
          user: user._id,
          text: newComment,
          rating: newRating,
          isApproved: approvedFlag,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // refresh commodity
      const res = await axios.get(`${url}/api/commodity/${id}`);
      setCommodity(res.data.data);
      setNewComment("");
      setNewRating(null);
      setCommentPage(1); // reset to first page
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  // χρησιμοποιείτε στην παρακάτω useEffect fetchSuggestions
  interface SemanticSearchResult {
    commodity: CommodityType;
    score: number;
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!showSuggestions || !commodity?._id) return;

      try {
        const res = await axios.get<{
          status: boolean;
          data: SemanticSearchResult[];
        }>(
          `${url}/api/ai-embeddings/search`,
          { params: { query: commodity.name } } // TODO στο μέλλον θα πρέπει το backend να δέχετε vector
        );

        // flatten to just commodities
        setSuggested(res.data.data.map((r) => r.commodity));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions();
  }, [showSuggestions, commodity, url]);

  // favorites logic. πρώτα φέρνω ενα arr με τα id τους και έλεγχω αν το commodity._id είναι ήδη μεσα σε αυτα. Μετα δύο useEffect για να προσθέσω αφαιρέσω
  useEffect(() => {
    const fetchFavoritesStatus = async () => {
      const userId = user?.id || user?._id;
      if (!userId || !commodity?._id) return;

      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${url}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favs: string[] = res.data.data.favorites || [];
        setIsFavorite(favs.includes(commodity._id.toString()));
      } catch (err) {
        console.error("Failed to check favorites", err);
      }
    };
    fetchFavoritesStatus();
  }, [user, commodity, url]);

  const handleAddToFavorites = async () => {
    const userId = user?.id || user?._id;
    if (!userId || !commodity?._id) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${url}/api/users/${userId}/favorites`,
        { commodityId: commodity._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHasFavorites(true);
      setIsFavorite(true);
    } catch (err) {
      console.error("Failed to add favorite", err);
    }
  };

  const handleRemoveFromFavorites = async () => {
    const userId = user?.id || user?._id;
    if (!userId || !commodity?._id) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${url}/api/users/${userId}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { commodityId: commodity._id }, // DELETE needs data in axios
      });
      setIsFavorite(false);
      // ✅ re-check favorites count
      const res = await axios.get(`${url}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favs = res.data.data.favorites || [];
      setHasFavorites(favs.length > 0);
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };

  // =========================================
  // === GRID TEMPLATE LOGIC (CrossGrid style)
  // =========================================

  // Βασικό χρώμα γραμμών (πράσινο από το template)
  const lineColor = "#008482";

  /**
   * === ΣΤΑΘΕΡΟ ΣΤΥΛ ΚΑΘΕΤΗΣ ΓΡΑΜΜΗΣ ===
   * Κάθε κατακόρυφη γραμμή έχει:
   * - width 3px
   * - backgroundColor lineColor
   * - flexShrink:0 για να μην "σπάνε"
   */
  const verticalLine = {
    width: "3px",
    backgroundColor: lineColor,
    flexShrink: 0,
  };

  /**
   * === ΜΕΤΡΗΣΗ ΥΨΟΥΣ TOP ROW & ΟΛΟΥ LEFT CONTENT ===
   * Θέλουμε:
   * 1) topRowHeight → για να μπει η μεσαία γραμμή ανάμεσα στα rows
   * 2) childHeight → για να μπει η κάτω γραμμή στο τέλος της αριστερής στήλης
   */
  const leftContentRef = useRef<HTMLDivElement | null>(null);
  const topLeftRef = useRef<HTMLDivElement | null>(null);
  const topRightRef = useRef<HTMLDivElement | null>(null);
  const [topLeftHeight, setTopLeftHeight] = useState(0);

  const [childHeight, setChildHeight] = useState(0);
  const [topRowHeight, setTopRowHeight] = useState(0);

  useLayoutEffect(() => {
    // ύψος όλης της αριστερής στήλης (top-left + bottom-left)
    if (leftContentRef.current) {
      setChildHeight(leftContentRef.current.getBoundingClientRect().height);
    }

    if (topLeftRef.current) {
      setTopLeftHeight(topLeftRef.current.getBoundingClientRect().height);
    }

    // ύψος top row = max( εικόνες, title/price )
    const hLeft = topLeftRef.current?.getBoundingClientRect().height ?? 0;
    const hRight = topRightRef.current?.getBoundingClientRect().height ?? 0;
    setTopRowHeight(Math.max(hLeft, hRight));
  }, [commodity, comments, showSuggestions, newComment, newRating]);

  /**
   * === ΥΠΟΛΟΓΙΣΜΟΣ ΘΕΣΕΩΝ ΓΡΑΜΜΩΝ ===
   */
  const leftColumnHeight = childHeight + 400; // ίδιο "μαξιλάρι" με CrossGridLayout
  const bottomLineTop = leftColumnHeight - 4;

  // ΠΟΥ θα μπει η μεσαία γραμμή (ανάμεσα top & bottom row).
  // pt: "60px" της στήλης + topRowHeight + λίγο αέρα
  const middleGap = 40;
  const middleLineTop = 60 + topRowHeight + middleGap;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CommodityPageSkeleton />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!commodity) {
    return <Typography>No commodity found.</Typography>;
  }

  if (isMobile) {
    return (
      <>
        <CommodityPageMobile
          commodity={commodity}
          user={user}
          isFavorite={isFavorite}
          showSuggestions={showSuggestions}
          suggested={suggested}
          comments={comments}
          newComment={newComment}
          newRating={newRating}
          onAddToCart={addOneToCart} // ⬅️ ΕΔΩ
          onToggleFavorite={
            isFavorite ? handleRemoveFromFavorites : handleAddToFavorites
          }
          setShowSuggestions={setShowSuggestions}
          setNewComment={setNewComment}
          setNewRating={setNewRating}
          commentPage={commentPage}
          setCommentPage={setCommentPage}
          commentsPerPage={commentsPerPage}
          handleAddComment={handleAddComment}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${commodity.name} | Έχω μια Ιδέα`}</title>
        <meta
          name="description"
          content={
            commodity.description
              ? commodity.description.slice(0, 150)
              : "Δείτε λεπτομέρειες για το προϊόν μας."
          }
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/commodity/${
            commodity.slug ?? commodity._id
          }`}
        />
      </Helmet>

      <TopCategoryGridHeader />

      {/* === OUTER WRAPPER (CrossGrid style) === */}
      <Box sx={{ px: "40px", mx: "40px", py: 0, position: "relative" }}>
        {/* === TOP HORIZONTAL LINE === */}
        <Box
          sx={{
            position: "absolute",
            top: "134px",
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
          }}
        />

        {/* === MIDDLE HORIZONTAL LINE (between top & bottom sections) === */}
        <Box
          sx={{
            position: "absolute",
            top: `${middleLineTop}px`,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
          }}
        />

        {/* === BOTTOM HORIZONTAL LINE === */}
        <Box
          sx={{
            position: "absolute",
            top: `${bottomLineTop}px`,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
          }}
        />

        {/* ======================================================
            === MAIN GRID  ===
         ====================================================== */}
        <Box sx={{ display: "flex", width: "100%" }}>
          {/* LEFT VERTICAL LINE */}
          <Box sx={verticalLine} />

          {/* ================================================
              LEFT SIDE — GALLERY + DESCRIPTION + REVIEWS
           ================================================ */}
          <Box
            sx={{
              width: "75%",
              px: 3,
              pt: "60px",
              height: `${leftColumnHeight}px`,
              boxSizing: "content-box",
            }}
          >
            <Box ref={leftContentRef}>
              {/* TOP-LEFT = GALLERY */}
              <Box ref={topLeftRef} sx={{ mb: 4 }}>
                <Suspense fallback={<GalleryCommodityPageSkeleton />}>
                  <GalleryCommodityPage commodity={commodity} />
                </Suspense>
              </Box>

              {/* BOTTOM-LEFT = Description */}
              <ItemDescription commodity={commodity} />

              {commodity.variants && commodity.variants.length > 0 && (
                // <VariantSelector
                //   variants={commodity.variants}
                //   value={selectedVariantId}
                //   onChange={setSelectedVariantId}
                // />
                <VariantAttributeSelector
                  variants={commodity.variants}
                  value={selectedVariantId}
                  onChange={setSelectedVariantId}
                />
              )}

              {/* Suggestions (optional) */}
              {showSuggestions && (
                <ItemSuggestions
                  suggestions={suggested}
                  currentId={commodity._id}
                />
              )}

              {/* BOTTOM-LEFT = Reviews */}
              <ReviewSection
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

          {/* MIDDLE VERTICAL LINE */}
          <Box sx={verticalLine} />

          {/* ================================================
              RIGHT SIDE — TITLE/PRICE + BUTTONS
           ================================================ */}
          <Box
            sx={{
              width: "25%",
              px: 3,
              pt: "60px",
            }}
          >
            {/* TOP-RIGHT = Title + Price */}
            <Box
              ref={topRightRef}
              sx={{ mt: `${topLeftHeight - 210}px` }} // -40 για να μπει ακριβώς ίδια ευθεία
            >
              <ItemTitlePrice commodity={commodity} />
            </Box>

            {/* buttons fall under the middle horizontal line */}
            <Box sx={{ mt: "190px" }} />

            {/* BOTTOM-RIGHT = Add to Cart / Favorites / Suggestions */}
            <ItemActionsBtns
              stock={commodity.stock}
              userExists={!!user}
              isFavorite={isFavorite}
              hasVariants={!!commodity.variants?.length}
              variantSelected={!!selectedVariantId}
              onAddToCart={() => {
                if (!confirmRequiresProcessing(commodity)) return;
                addOneToCart(commodity._id, selectedVariantId ?? undefined);
              }}
              onToggleFavorite={
                isFavorite ? handleRemoveFromFavorites : handleAddToFavorites
              }
              showSuggestions={showSuggestions}
              onToggleSuggestions={() => setShowSuggestions((prev) => !prev)}
            />
          </Box>

          {/* RIGHT VERTICAL LINE */}
          <Box sx={verticalLine} />
        </Box>
      </Box>
    </>
  );
};

export default CommodityPage;
