/*
2️⃣. 
φορτώνει όλα τα plugins του EditorJs και καθορίζει τα βασικά settings τους
Προσοχή - άλλαξα το upload των images και ataches για να χρησιμοποιεί αυτό που έυτιαξα στο κατάστημα. Δες: frontend\src\hooks\useAppwriteUploader.ts
Μετα δες Dashboard.tsx → main editor screen for creating/editing posts
*/

// src/hooks/useInitEditor.js
import { useEffect, useContext } from 'react';
import EditorJS from '@editorjs/editorjs';
import { VariablesContext } from "../../context/VariablesContext";

// για να μετατρέψω το editorJsData data σε html
// import edjsParser from 'editorjs-parser';
// import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import ImageTool from '@editorjs/image';
import AttachesTool from '@editorjs/attaches';
import Embed from '@editorjs/embed'
import Quote from '@editorjs/quote'

import AlignmentTuneTool from 'editorjs-text-alignment-blocktune'; // δεν είχε justify alignment αλλά είχε διαφορ καλά για headers και list Οπότε το κρατάω και χρησιμοποιω το Pargraph-with-alignment για το justify
import Paragraph from 'editorjs-paragraph-with-alignment';

import { useAppwriteUploader } from '../../hooks/useAppwriteUploader';

export const useInitEditor = (
  editorRef: React.RefObject<EditorJS | null>
) => {
  const { url } = useContext(VariablesContext);
  const { ready, uploadFile, getFileUrl } = useAppwriteUploader()
  
  useEffect(() => {
    if (!editorRef.current) {
      // κάνω instanciete
      // ** αυτό είναι ένα συμαντικό σημείο ** Εδώ αποθηκεύουμε μεσα στην ref όλον τον Editor μας
      editorRef.current = new EditorJS({
        //IMPORTANT λέω τι id έχει το dom element μου στο οποίο θα εκχωρήσω τις ιδιοτητες του κειμενογράφου
        holder: 'editorjs',
        // μεσα sto tools βαζω ένα ένα τα εργαλέια
        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true, // This enables inline tools like bold/italic
            config: {
              placeholder: 'Start writing your text here...',
              preserveBlank: true,
            },
          },
          header: {
            class: Header as unknown as import('@editorjs/editorjs').ToolConstructable,
            inlineToolbar: true,
            config: {
              placeholder: 'Enter a title',
            },
            tunes: ['alignment'],
          },
          list: {
            class: List,
            inlineToolbar: true,
            tunes: ['alignment'],
          },
          marker: Marker,
          inlineCode: InlineCode,
          alignment: {
            class: AlignmentTuneTool,
            config: {
              default: 'right',
              blocks: {
                header: 'left',
                list: 'left',
              },
            },
          },
          // ακολουθούν οι παλιές μέθοδοι που είχα για image και attaches που χρησιμοποιούσαν multer. εδώ θα κάνω χρήση του Hook που είχα φτιάξει για την εισαγωγή εικόνων στα εμπορεύματα στο κομματι του ΄καταστήματος' αλλα δεν τις σβήνω και τις κάνω comment out για άλλες περιπτώσεις στο μέλλον. Δες το αρχειο frontend\src\hooks\useAppwriteUploader.ts
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  try {
                    const res = await uploadFile(file);
                    const url = getFileUrl(res.$id);
                    return {
                      success: 1,
                      file: {
                        url,
                      },
                    };
                  } catch (err) {
                    console.error("Appwrite image upload failed:", err);
                    return { success: 0 };
                  }
                },
              },
            },
          },

          attaches: {
            class: AttachesTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  try {
                    const res = await uploadFile(file);
                    const url = getFileUrl(res.$id);
                    return {
                      success: 1,
                      file: {
                        url,
                        name: file.name,
                        size: file.size,
                      },
                    };
                  } catch (err) {
                    console.error("Appwrite attach upload failed:", err);
                    return { success: 0 };
                  }
                },
              },
            },
          },          

          // image: {
          //   class: ImageTool,
          //   config: {
          //     endpoints: {
          //       byFile: `${url}/api/uploads`,
          //     },
          //     captionPlaceholder: 'Add a caption...', 
          //     features: {
          //       border: true,
          //       stretched: true,
          //       background: true,
          //       caption: true
          //     }
          //   },
          // },
          // attaches: {
          //   class: AttachesTool,
          //   config: {
          //     endpoint: `${url}/api/uploads`, 
          //     field: 'image', // ← keep same as multer config - that’s just the field name — it can still handle any file types as long as your multer config accepts them
          //     types: '.pdf,.doc,.docx,.txt,.zip',
          //     buttonText: 'Upload File',
          //     errorMessage: 'Upload failed'
          //   }
          // },
          embed: {
            class: Embed,
            inlineToolbar: true,
            config: {
              services: {
                youtube: true,
                vimeo: true,
                twitter: true,
                instagram: true,
                facebook: true,
                tiktok: true,
                soundcloud: true,
                twitch: true,
                pinterest: true,
                spotify: true,
                codepen: true,
                jsfiddle: true,
                giphy: true,
                imgur: true,
              }
            }
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: "Quote's author",
            },
          },
        },
        onReady: () => {
          // console.log('Editor.js is ready');
        },
      });
    }
    
    // Cleanup when component unmounts
    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [editorRef, getFileUrl, uploadFile, ready, url]);
};
