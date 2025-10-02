import DOMPurify from 'dompurify'; // αυτή η βιβλιοθήκη μπείκε γιατι το editorjsData είναι σε μορφή html που πρέπει να γίνει ρεντερ. αλλά αυτό είναι επικύνδηνο γιατι σημάινει οτι επιτρέπω στον χρίστη να κάνει Inject html
import type { EditorJsContent } from '../blogTypes/blogTypes';
import { Box, Checkbox, Link, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import type { JSX } from 'react';

interface Props {
  editorJsData: EditorJsContent  | null,
  subPageName: string
}

const RenderedEditorJsContent = ({ editorJsData, subPageName }: Props) => {

  return (
    <>
      <div>
        {/* 
         to render ηταν δύσκολο και συμβουλευτικα αρκετα το gpt
        αρχικα ελέγχουμε αν υπάρχει state editorJsData και αν αυτό το state έχει μέσα του blocks
        και μετά με μια map παίρνουμε το κάθε block και το render-αρουμε ανάλογα με τον τύπο του block χρησιμοποιόντας διάφορες συνθήκες if 
        */}
        {subPageName &&
          <p style={{ color: 'gray', fontStyle: 'italic' }}>
            📄 Page: {subPageName}
          </p>          
        }
        {editorJsData?.blocks?.map((block, index) => {
          if (block.type === 'paragraph') {
            // με μια console.log είδα  το alignmeent και το παιρνω απο το block.tunes.alignment
            const alignStyle = {
              textAlign: block.data.alignment || 'left',
            };

             // Καθαρίζει το HTML περιεχόμενο για να αποφευχθεί XSS (κακόβουλο script injection)
            const sanitized = DOMPurify.sanitize(block.data.text);
             // Ελέγχει αν το κείμενο είναι κενό ή περιέχει μόνο κενά ώστε να αποδοθεί ένα κενό μπλοκ
            const isEmpty = sanitized.trim() === '';
  
            // Αν είναι κενό, δώσε non-breaking space ώστε να αποδοθεί το <p>, αλλιώς δώσε το καθαρισμένο κείμενο
            return (
              <Typography
                key={index}
                variant="body1"
                sx={alignStyle}
                dangerouslySetInnerHTML={{
                  __html: isEmpty ? "&nbsp;" : sanitized,
                }}
              />
            );
          }
          if (block.type === 'header') {
            // επειδή τα h1 h2 κλπ δεν είναι απλά attributes αλλά θα έχουν την μορφή <h1> κλπ φτιάχνω ένα tag για να γίνει <Tag>
            // εδω το alignment είναι tune γιατι το παίρνει απο AlignmentTuneTool
            // React doesn’t automatically know this is a valid JSX element type.
            const Tag = (`h${block.data.level || 2}`) as keyof JSX.IntrinsicElements;
            const alignment = block.tunes?.alignment?.alignment || 'left';
            return (
              <Tag
                key={index}
                style={{ textAlign: alignment }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(block.data.text),
                }}
              />
            );
          }
          // το List ήταν αρκετά πολυπλοκο γιατί χρειαζόταν να ελεξω αν είναι ordered η unorder και αν είναι checkbox, όπου αν είναι αν είναι checked και μετά να κάνω το ανάλογο map για την παραγωγή της λίστας
          // list και checked list σπάσανε σε δυο

          // === Checklist Block ===
          if (block.type === "list" && block.data.style === "checklist") {
            // το i είναι ένα index (1,2,3...)
            // το !! στη JS κάνει μετατροπή οποιασδήποτε τιμής σε boolean

            const items = block.data.items.map((item, i) => {
              if (typeof item === "string") {
                return (
                  <ListItem key={i} disablePadding>
                    {/* disabled για να φαίνεται μόνο το checkbox χωρίς να μπορεί να αλλάξει */}
                    <Checkbox checked={false} disabled sx={{ mr: 1 }} />

                    {/* Το κείμενο του κάθε στοιχείου */}
                    <ListItemText
                      primary={DOMPurify.sanitize(item)}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                );
              }

              // εδώ item είναι αντικείμενο { content, meta, items }
              const isChecked = !!item.meta?.checked;
              const text = item.content;

              return (
                <ListItem
                  key={i}
                  sx={{ display: "flex", alignItems: "center" }}
                  disablePadding
                >
                  {/* disabled για να φαίνεται μόνο το checkbox χωρίς να μπορεί να αλλάξει */}
                  <Checkbox checked={isChecked} disabled sx={{ mr: 1 }} />

                  {/* Το κείμενο του κάθε στοιχείου */}
                  <ListItemText
                    primary={DOMPurify.sanitize(text)}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              );
            });

            // Έχει δύο return: 
            // 1) μέσα στο map → φτιάχνει το κάθε μεμονωμένο <ListItem> 
            // 2) εδώ έξω → παράγει τη <List> που τα περιέχει όλα
            return (
              <List key={index} sx={{ pl: 0 }}>
                {items}
              </List>
            );
          }

          // === Normal List Block (ordered / unordered) ===
          if (block.type === "list" && (block.data.style === "ordered" || block.data.style === "unordered")) {
            // alignment είναι tune (plugin από το EditorJS AlignmentTuneTool)
            const alignment = block.tunes?.alignment?.alignment || "left";
            const alignStyle = { textAlign: alignment };

            // normal ordered/unordered list
            const items = block.data.items.map((item, i) => {
              // Το text μπορεί να είναι string (old plugin) ή object με content (νέος plugin).
              const text =
                typeof item === "string"
                  ? item
                  : "content" in item
                  ? item.content
                  : "[invalid item]";

              return (
                <ListItem
                  key={i}
                  disablePadding
                  sx={{ display: "list-item" }} // restore list-item display
                >
                  {/* Εδώ βάζουμε το καθαρισμένο text με DOMPurify */}
                  <ListItemText primary={DOMPurify.sanitize(text)} />
                </ListItem>
              );
            });

            return (
              <List
                key={index}
                sx={{
                  ...alignStyle,
                  listStyleType: block.data.style === "ordered" ? "decimal" : "disc", // force markers
                  pl: 4,
                }}
                component={block.data.style === "ordered" ? "ol" : "ul"}
              >
                {items}
              </List>
            );
          }
          // === Image Block ===
          if (block.type === "image") {
            return (
              <Box
                key={index}
                sx={{
                  textAlign: "center", // κέντρο για καλύτερη εμφάνιση
                  my: 2,
                }}
              >
                {/* 
                  MUI Box με component="img" → ρέντερ σαν <img>.
                  Το maxWidth/Height και objectFit είναι ίδια με τα δικά σου.
                */}
                <Box
                  component="img"
                  src={block.data.file.url}
                  alt={block.data.caption  || "Blog image"}
                  title={block.data.caption || "Blog image"}
                  loading="lazy"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 400,          // <-- Εδώ το πρόσθεσα
                    objectFit: "contain",    // <-- Εδώ το πρόσθεσα
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                />

                {/* Caption κάτω από την εικόνα */}
                {block.data.caption && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    {block.data.caption}
                  </Typography>
                )}
              </Box>
            );
          }
          if (block.type === "attaches") {
            const { file, title } = block.data;
            // Αν δεν υπάρχει τίτλος, παίρνουμε το όνομα του αρχείου ή το τελευταίο κομμάτι του URL
            const fileName = title || file?.name || file?.url?.split("/").pop();

            return (
              <Box
                key={index}
                sx={{
                  my: 2, // margin-y: 2 → αντί για className="my-2"
                }}
              >
                {/* Εμφάνιση label + σύνδεσμος για το αρχείο */}
                <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                  📎 file:
                </Typography>
                <Link
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  {fileName}
                </Link>
              </Box>
            );
          }
          if (block.type === "embed") {
            return (
              <Box
                key={index}
                sx={{
                  my: 2, // margin-top & bottom
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* To iframe το κρατάμε όπως είναι γιατί χρειάζεται για το embed */}
                <Box
                  component="iframe"
                  src={block.data.embed}
                  width={block.data.width || "100%"}
                  height={block.data.height || 315}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{
                    border: 0,
                    maxWidth: "100%",
                    borderRadius: 1,
                  }}
                  title="Embedded content"
                />

                {/* Caption (προαιρετικό) */}
                {block.data.caption && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, color: "text.secondary", textAlign: "center" }}
                  >
                    {block.data.caption}
                  </Typography>
                )}
              </Box>
            );
          }
          if (block.type === "quote") {
            const alignment = block.data.alignment || "left";

            return (
              <Paper
                key={index}
                elevation={0} // flat style, but we could add shadow if we want emphasis
                sx={{
                  textAlign: alignment,
                  fontStyle: "italic",
                  borderLeft: "4px solid",
                  borderColor: "grey.400",
                  p: 2,
                  my: 2,
                  bgcolor: "grey.50",
                }}
              >
                {/* Κύριο κείμενο */}
                <Typography variant="body1">{block.data.text}</Typography>

                {/* Προαιρετικό caption */}
                {block.data.caption && (
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, color: "text.secondary" }}
                  >
                    — {block.data.caption}
                  </Typography>
                )}
              </Paper>
            );
          }
          if (block.type === "inlineCode") {
            return (
              <Typography
                key={index}
                component="code"
                sx={{
                  fontFamily: "Monospace, monospace", // monospace font
                  bgcolor: "grey.100",                // subtle background
                  px: 0.5,                            // small horizontal padding
                  borderRadius: 0.5,
                  fontSize: "0.9em",
                }}
              >
                {block.data.code}
              </Typography>
            );
          }
          return null;
        })}
      </div>
    </>
  )
}
export default RenderedEditorJsContent