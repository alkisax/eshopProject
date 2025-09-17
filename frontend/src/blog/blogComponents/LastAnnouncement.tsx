// src/components/LastAnnouncement.tsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, CircularProgress, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { VariablesContext } from "../../context/VariablesContext";
import RenderedEditorJsContent from "./RenderedEditorJsContent";
import { getPreviewContent } from "../blogUtils/editorHelper";
import type { EditorJsContent } from "../blogTypes/blogTypes";


type Announcement = {
  _id: string;
  title: string;
  content: EditorJsContent;
  createdAt: string;
  slug?: string;
  subPage?: { _id: string; name: string } | string;
};

const LastAnnouncement = () => {
  const { url } = useContext(VariablesContext);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncement = async () => {
        try {
        const res = await axios.get(`${url}/api/posts`); // όλα
        console.log('res', res)
        const all = res.data.data;
        const announcements = all.filter((p: any) => p.subPage?.name === "announcements");
        const latest = announcements.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setAnnouncement(latest);
        } catch (err) {
        console.error("Error fetching announcements", err);
        } finally {
        setLoading(false);
        }
    };
    fetchAnnouncement();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!announcement) {
    return <Typography variant="body2">Δεν υπάρχουν ανακοινώσεις ακόμη.</Typography>;
  }

  return (
    <Card
      sx={{ mt: 4, cursor: "pointer" }}
      onClick={() => navigate(`/posts/${announcement.slug || announcement._id}`)}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {announcement.title}
        </Typography>
        <RenderedEditorJsContent
          editorJsData={getPreviewContent(announcement.content, 50)}
          subPageName={
            typeof announcement.subPage === "object" && "name" in announcement.subPage
              ? announcement.subPage.name
              : ""
          }
        />
      </CardContent>
    </Card>
  );
};

export default LastAnnouncement;
