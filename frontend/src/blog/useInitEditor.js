// src/hooks/useInitEditor.js
import { useEffect } from 'react';
import EditorJS from '@editorjs/editorjs';
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

export const useInitEditor = (editorRef, backEndUrl) => {
  useEffect(() => {
    if (!editorRef.current) {
      // κάνω instanciete
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
            class: Header,
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
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                // byFile: `${backEndUrl}/api/images`,
                byFile: `${backEndUrl}/api/uploads`,
              },
              captionPlaceholder: 'Add a caption...', 
              features: {
                border: true,
                stretched: true,
                background: true,
                caption: true
              }
            },
          },
          attaches: {
            class: AttachesTool,
            config: {
              endpoint: `${backEndUrl}/api/uploads`, 
              field: 'image', // ← keep same as multer config - that’s just the field name — it can still handle any file types as long as your multer config accepts them
              types: '.pdf,.doc,.docx,.txt,.zip',
              buttonText: 'Upload File',
              errorMessage: 'Upload failed'
            }
          },
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
  }, [editorRef, backEndUrl]);
};
