import { useEffect, useState, useContext } from "react";
import axios from "axios";
// import { Box, Typography, Card, CardContent, CardMedia, Button, Stack } from "@mui/material";
import { VariablesContext } from "../../context/VariablesContext";
import type { CommodityType } from "../../types/commerce.types";
// import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import LatestCommoditiesSkeleton from "../skeletons/LatestCommoditiesSkeleton";
import { useNavigate } from "react-router-dom";

const LatestCommodities = () => {
  const { url } = useContext(VariablesContext);
  const [latest, setLatest] = useState<CommodityType[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${url}/api/commodity/search`, {
          params: {
            page: 1,
            limit: 3,
            // search, categories ΔΕΝ τα δίνουμε
            // includeInactive ΔΕΝ το δίνουμε → default false → μόνο active
          },
        });

        setLatest(res.data.data.items);
      } catch (err) {
        console.error("Failed to fetch latest commodities", err);
      }
    };

    fetchLatest();
  }, [url]);

  // if (latest.length === 0) return null;
  if (latest.length === 0) return <LatestCommoditiesSkeleton />;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div id="home-carousel">
      <Slider {...settings}>
        {latest.map((c) => (
          <div key={c._id}>
            <img
              src={c.images?.[0] || "/placeholder.jpg"}
              alt={c.name}
              title={c.name}
              loading="lazy"
              onClick={() => navigate(`/commodity/${c.slug ?? c._id}`)}
              style={{
                maxHeight: 300,
                width: "50%",
                height: "auto",
                objectFit: "cover",
                margin: "0 auto",
              }}
            />
            <h3>{c.name}</h3>
            <p>
              {c.price} {c.currency}
            </p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default LatestCommodities;

  // TODO this fetches all comodities. has to be reworked to do the hardwork on backend
  // useEffect(() => {
  //   const fetchLatest = async () => {
  //     try {
  //       const res = await axios.get(`${url}/api/commodity/`);
  //       const all = res.data.data;
  //       const sorted = [...all].sort(
  //         (a, b) =>
  //           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  //       );
  //       setLatest(sorted.slice(0, 3));
  //     } catch (err) {
  //       console.error("Failed to fetch commodities", err);
  //     }
  //   };
  //   fetchLatest();
  // }, [url]);
