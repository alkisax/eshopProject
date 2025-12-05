// backend\src\excel\utils\unzipImages.ts
// 3c. util που μας επιστρέφει βιβλιοθήκη με το όνομα του κάθε αρχείου στο zip/rar αρχείο μας και το αντίστιχο buffer της εικόνας. μετά θα τα κάνουμε αυτόματα upload στο appwrite

import unzipper from 'unzipper';
import path from 'path';

//  παίρνει buffer και επιστρέφει obj με key-το όνομα του αρχείου και value-το buffer της εικόνας
export const unzipImages = async (
  zipBuffer: Buffer
): Promise<Record<string, Buffer>> => {
  const images: Record<string, Buffer> = {};

  // Ανοίγουμε το ZIP και διαβάζουμε όλα τα entries
  // τώρα το directory έχει ένα array τύπου [{path: "keri1.jpg", type: "File", compressedSize: 12345, uncompressedSize: 33011, buffer: [Function: buffer], stream: [Function: stream],...},{},{}]
  const directory = await unzipper.Open.buffer(zipBuffer);

  for (const fileEntry of directory.files) {
    // το path του κάθε αρχείου μέσα στο zip, ουσιαστιά το filename του
    const filename = fileEntry.path;
    // console.log('→ Found ZIP entry:', filename);

    // Αγνοούμε directories
    if (fileEntry.type !== 'File') {
      continue;
    }

    // Επιτρέπουμε μόνο εικόνες
    const fileExtension = path.extname(filename).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fileExtension)) {
      continue;
    }

    // Παίρνουμε το binary content
    const content = await fileEntry.buffer();

    // Αποθηκεύουμε σε { {filename: buffer},{},{} }
    images[filename] = content;
  }

  return images;
};
