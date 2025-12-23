// frontend\src\utils\resizeImage.ts

// resize εικόνας αν ξεπερνά τα 2MB
// frontend/src/utils/resizeImage.ts

export interface ResizeResult {
  file: File;
  resized: boolean;
  originalSize: number;
  newSize: number;
}

export const resizeImageIfNeeded = async (
  file: File,
  maxSizeMB = 2
): Promise<ResizeResult> => {
  if (!file.type.startsWith('image/') || file.size <= maxSizeMB * 1024 * 1024) {
    return {
      file,
      resized: false,
      originalSize: file.size,
      newSize: file.size,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    reader.onerror = reject;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      const MAX = 1600;
      let { width, height } = img;

      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));

          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({
            file: resizedFile,
            resized: true,
            originalSize: file.size,
            newSize: resizedFile.size,
          });
        },
        'image/jpeg',
        0.75
      );
    };

    reader.readAsDataURL(file);
  });
};
