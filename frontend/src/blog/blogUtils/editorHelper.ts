import axios from 'axios';

export const handlePageSelect = (e, setSelectedPage) => {
  const value = e.target.value
  if (value === '__new__') {
    setSelectedPage('')
  } else {
    setSelectedPage(value)
  }
}

export const handleNewPageSubmit = async (pages, newPage, backEndUrl, setPages, setSelectedPage, setNewPage) => {
  if (!newPage) return;
  try {
    const res = await axios.post(`${backEndUrl}/api/subPages`, { name: newPage });
    setPages([...pages, res.data]);
    setSelectedPage(res.data._id);
    setNewPage('');
  } catch (err) {
    console.error('Error creating page', err);
  }
};

export const handleSubmit = async (editorRef, setEditorJsData, isEditMode, id, backEndUrl, selectedPage, isPinned) => {
  if(editorRef.current) {
    try {
      //  η save() ερχεται απο τον editorjs και επιστρέφει μια υπόσχεση με τα δεδομένα του editor
      const outputData = await editorRef.current.save()
      // localStorage.setItem('editorData', JSON.stringify(outputData));
      setEditorJsData(outputData);
      console.log('Data saved:', outputData);

      if (isEditMode && id) {
        await axios.put(`${backEndUrl}/api/posts/${id}`, {
          content: outputData,
          subPage: selectedPage,
          pinned: isPinned
        })
        console.log("✅ Post updated");
        alert("Post updated successfully!");
      } else {
        await axios.post(`${backEndUrl}/api/posts`, {
          content: outputData,
          subPage: selectedPage,
          pinned: isPinned
        })
        console.log("✅ Post created");
        alert("Post created successfully!");
      }

      // για την αποθήκευση στην Mongo        
      // για επιπλέων αποθήκευση εικόνων στην mongoDB ως base64. Τo axios παραπάνω τα σώζει ως λινκ. πχ http://localhost:3001/uploads/image-1751308923423.jpg
      // const imageBlocks = outputData.blocks.filter(block => block.type === 'image')

      // for (const block of imageBlocks) {
      //   const imageUrl = block.data.file.url

        // // ✅ Skip if image already existed in original post
        // if (originalImageUrls.includes(imageUrl)) {
        //   console.log(`Skipping already uploaded image: ${imageUrl}`);
        //   continue;
        // }

        // try {
        //   // 👇 ΠΑΡΕ ΤΗΝ ΕΙΚΟΝΑ ως arraybuffer (BINARY)
        //   const imageResponse = await axios.get(imageUrl, {
        //     responseType: 'arraybuffer'
        //   })

        //   // 👇 Convert binary to Blob/File
        //   const mimeType = block.data.file.mime || 'image/jpeg';
        //   const buffer = imageResponse.data;
        //   const file = new File([buffer], 'editor-image.jpg', { type: mimeType });

        //   // 👇 Upload using FormData (required for multer backend)
        //   const formData = new FormData();
        //   formData.append('image', file);
        //   formData.append('name', block.data.caption || 'Image');
        //   formData.append('desc', block.data.caption || '');

        //   await axios.post(`${backEndUrl}/api/images`, formData)
        //   console.log('✅ Image sent as JSON to MongoDB');
        // } catch (err) {
        //   console.error('❌ Failed to upload image:', err);
        // }
      // }
    } catch (error) {
      console.error("saving failed", error)
    };
  }
}

export const handlePreview = async (editorRef, setEditorJsData) => {
  if (!editorRef.current) {
    console.error("Editor instance not ready");
    return;
  }
  const outputData = await editorRef.current.save()
  setEditorJsData(outputData);
}

// αυτή η συνάρτηση κρατάει μόνο την πρώτη εικόνα και τις πρώτες 70 λέξεις. Σε μεγάλο βαθμό απο GPT
export const getPreviewContent = (content, maxWords = 70) => {
  const previewBlocks = [];
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
          text: trimmedWords.join(' ') + (words.length > remaining ? '...' : '')
        }
      });

      wordCount += trimmedWords.length;
    }

    if (wordCount >= maxWords && imageIncluded) break;
  }

  return {
    ...content,
    blocks: previewBlocks
  };
};