import React from "react";
import DOMPurify from 'dompurify'; // αυτή η βιβλιοθήκη μπείκε γιατι το editorjsData είναι σε μορφή html που πρέπει να γίνει ρεντερ. αλλά αυτό είναι επικύνδηνο γιατι σημάινει οτι επιτρέπω στον χρίστη να κάνει Inject html

const RenderedEditorJsContent = ({ editorJsData, subPageName }) => {

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
              <p 
                key={index}
                style={alignStyle}
                dangerouslySetInnerHTML={{ 
                  __html: isEmpty ? '&nbsp;' : sanitized 
                }}
              >
              </p>
            )
          }
          if (block.type === 'header') {
            // επειδή τα h1 h2 κλπ δεν είναι απλά attributes αλλά θα έχουν την μορφή <h1> κλπ φτιάχνω ένα tag για να γίνει <Tag>
            // εδω το alignment είναι tune γιατι το παίρνει απο AlignmentTuneTool
            const Tag = `h${block.data.level || 2}`;
            const alignment = block.tunes?.alignment?.alignment || 'left';
            return (
              <Tag 
                key={index}
                style={{ textAlign: alignment }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.data.text) }}
              >
              </Tag>
            )
          }
          // το List ήταν αρκετά πολυπλοκο γιατί χρειαζόταν να ελεξω αν είναι ordered η unorder και αν είναι checkbox, όπου αν είναι αν είναι checked και μετά να κάνω το ανάλογο map για την παραγωγή της λίστας
          if (block.type === 'list') {
            const alignment = block.tunes?.alignment?.alignment || 'left';
            const alignStyle = { textAlign: alignment };

            if (block.data.style === 'checklist') {
              // console.log(block.data.items);
              // το i είναι ένα index (1,2,3...)
              const items = block.data.items.map((item, i) => {
                //Το !! στh JS κάνει μετατροπή οποιασδήποτε τιμής σε boolean.
                const isChecked = !!item.meta?.checked; 

                return (
                  <li 
                    key={i} 
                    style={{ listStyleType: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <input 
                      type="checkbox" 
                      disabled 
                      checked={isChecked} 
                      style={{ marginRight: 8 }} 
                    />
                    <span>{item.content}</span>
                  </li>
                );
              });
              // έχει δύο return μια μέσα στο map όπου σε κάθε βήμα μου φτιάχνει το κάθε μεμονομένο li  και μετ ατο προσθέτει στην items και ένα τελικό return έξω αππο την map όπου παράγει την ul
              return <ul key={index} style={alignStyle}>{items}</ul>;
            } else {
              // normal ordered/unordered list
              const items = block.data.items.map((item, i) => {
                const text = typeof item === 'string' ? item : item?.content || '[invalid item]';
                return <li key={i}>{text}</li>;
              });

              return block.data.style === 'ordered' ? (
                <ol key={index} style={alignStyle}>{items}</ol>
              ) : (
                <ul key={index} style={alignStyle}>{items}</ul>
              );
            }
          }
          if (block.type === 'image') {
            return (
              <div key={index}>
                <img 
                  src={block.data.file.url} 
                  alt={block.data.caption || ""} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px',    // <-- Εδώ το πρόσθεσα
                    objectFit: 'contain'  // <-- Εδώ το πρόσθεσα
                  }} 
                />
                {block.data.caption && <p>{block.data.caption}</p>}
              </div>
            );
          }
          if (block.type === 'attaches') {
            const { file, title } = block.data;
            const fileName = title || file?.name || file?.url?.split('/').pop(); // fallback to filename from URL

            return (
              <div key={index} className="my-2">
                file: <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {fileName}
                </a>
              </div>
            );
          }
          if (block.type === 'embed') {
            return (
              <div key={index} style={{ margin: '1em 0' }}>
                <iframe
                  src={block.data.embed}
                  width={block.data.width}
                  height={block.data.height}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                  title="Embedded content"
                  style={{ maxWidth: '100%' }}
                />
                {block.data.caption && (
                  <p style={{ fontSize: '0.9em', color: '#555', textAlign: 'center' }}>
                    {block.data.caption}
                  </p>
                )}
              </div>
            );
          }
          if (block.type === 'quote') {
            const alignment = block.data.alignment || 'left';
            return (
              <blockquote
                key={index}
                style={{
                  textAlign: alignment,
                  fontStyle: 'italic',
                  borderLeft: '4px solid #ccc',
                  padding: '0.5em 1em',
                  margin: '1em 0',
                }}
              >
                <p>{block.data.text}</p>
                {block.data.caption && (
                  <footer style={{ fontSize: '0.9em', color: '#666' }}>
                    — {block.data.caption}
                  </footer>
                )}
              </blockquote>
            );
          }
          if (block.type === 'inlineCode') {
            return <code key={index}>{block.data.code}</code>;
          }
          return null;
        })}
      </div>
    </>
  )
}
export default RenderedEditorJsContent