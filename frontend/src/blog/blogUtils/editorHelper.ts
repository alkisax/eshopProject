/* 
  3️⃣1/2
  📌 editorHelper.ts
  Βοηθητικές συναρτήσεις για την λειτουργία του EditorJS με backend.

  - handlePageSelect(e, setSelectedPage): χειρίζεται την αλλαγή σελίδας ή επιλογή νέας σελίδας.
  - handleNewPageSubmit(pages, newPage, backEndUrl, setPages, setSelectedPage, setNewPage): δημιουργεί νέα subPage μέσω backend.
  - handleSubmit(editorRef, setEditorJsData, isEditMode, id, backEndUrl, selectedPage, isPinned): αποθηκεύει τα δεδομένα του editor, δημιουργεί ή ενημερώνει post.
  - handlePreview(editorRef, setEditorJsData): αποθηκεύει προσωρινά τα δεδομένα για preview χωρίς submit.
  - getPreviewContent(content, maxWords): δημιουργεί μικρό preview με 1 εικόνα + 70 λέξεις (ή άλλο όριο).
*/

import axios from 'axios';
import type EditorJS from '@editorjs/editorjs';
import type { EditorJsContent, SubPageType } from '../blogTypes/blogTypes';
import type { OutputData } from '@editorjs/editorjs';

// handlePageSelect
export const handlePageSelect = (pageId: string, setSelectedPage: (val: string) => void) => {
  // if (pageId === '__new__') {
  //   setSelectedPage('');
  // } else {
    setSelectedPage(pageId);
  // }
};

// handleNewPageSubmit
export const handleNewPageSubmit = async (
  newPage: string,
  url: string,
  setPages: React.Dispatch<React.SetStateAction<SubPageType[]>>,
  setSelectedPage: (val: string) => void,
  setNewPage: (val: string) => void
) => {
  if (!newPage) return;
  const res = await axios.post(`${url}/api/subpage`, { name: newPage });
  const created = res.data.data || res.data;
  setPages((prev) => [...prev, created]);
  setSelectedPage(created._id);
  setNewPage('');
};

// handleSubmit
export const handleSubmit = async (
  editorRef: React.RefObject<EditorJS | null>,
  setEditorJsData: (data: EditorJsContent | null) => void,
  isEditMode: boolean,
  id: string | undefined,
  url: string,
  selectedPage: string,
  isPinned: boolean,
  title: string
) => {
  if (editorRef.current) {
    try {
      //  η save() ερχεται απο τον editorjs και επιστρέφει μια υπόσχεση με τα δεδομένα του editor
      const outputData: OutputData = await editorRef.current.save();
      setEditorJsData(outputData as unknown as EditorJsContent);
      console.log('Data saved:', outputData);

      if (isEditMode && id) {
        await axios.put(`${url}/api/posts/${id}`, {
          content: outputData,
          subPage: selectedPage,
          pinned: isPinned,
        });
        console.log('✅ Post updated');
        alert('Post updated successfully!');
      } else {
        await axios.post(`${url}/api/posts`, {
          title,
          content: outputData,
          subPage: selectedPage,
          pinned: isPinned,
        });
        console.log('✅ Post created');
        alert('Post created successfully!');
      }

      // για την αποθήκευση στην Mongo        
      // για επιπλέων αποθήκευση εικόνων στην mongoDB ως base64. Τo axios παραπάνω τα σώζει ως λινκ. πχ http://localhost:3001/uploads/image-1751308923423.jpg
      // αφαιρέθηκε. ο κώδικας μπορεί να βρεθεί στο Bolg&Dashboard project
    } catch (error) {
      console.error('saving failed', error);
    }
  }
};

// handlePreview
export const handlePreview = async (
  editorRef: React.RefObject<EditorJS | null>,
  setEditorJsData: (data: EditorJsContent | null) => void
) => {
  if (!editorRef.current) {
    console.error('Editor instance not ready');
    return;
  }
  const outputData: OutputData = await editorRef.current.save();
  console.log("🔎 Preview object:", JSON.stringify(outputData, null, 2));
  setEditorJsData(outputData as unknown as EditorJsContent);
};

// getPreviewContent
// αυτή η συνάρτηση κρατάει μόνο την πρώτη εικόνα και τις πρώτες 70 λέξεις. Σε μεγάλο βαθμό απο GPT
export const getPreviewContent = (
  content: EditorJsContent,
  maxWords = 70
): EditorJsContent => {
  const previewBlocks: typeof content.blocks = [];
  let wordCount = 0;
  let imageIncluded = false;

  for (const block of content.blocks) {
    if (block.type === 'image' && !imageIncluded) {
      previewBlocks.push(block);
      imageIncluded = true;
    }

    if (block.type === 'header') {
      previewBlocks.push(block);
    }

    if (block.type === 'paragraph') {
      const words = block.data.text.split(/\s+/);
      const remaining = maxWords - wordCount;

      if (remaining <= 0) break;

      const trimmedWords = words.slice(0, remaining);
      previewBlocks.push({
        ...block,
        data: {
          ...block.data,
          text:
            trimmedWords.join(' ') +
            (words.length > remaining ? '...' : ''),
        },
      });

      wordCount += trimmedWords.length;
    }

    if (wordCount >= maxWords && imageIncluded) break;
  }

  return {
    ...content,
    blocks: previewBlocks,
  };
};
