// backend\src\excel\utils\downloadExcelFromAppwrite.ts
// 3b1. επειδή θα έχουμε πολλές συναρτήσεις στον controller που θα κάνουν διαφορα πράγματα πχ import, export, sync κλπ κάνουμε το κατεύασμα του excel αρχείου απο το appwrite χωριστό module για να μπορούμε να το καλούμε
// δες και χωριστό downloader για zip/rar αρχεία που θα χρησιμοποιηθεί για τις εικόνες
// χρειάζετε fileId που θα το πάρει απο το front και bucket id που θα είναι στο env
// μας το επιστρέφει ως buffer

import { Client, Storage } from 'node-appwrite';

// ✅ init Appwrite client for server side (with API key)
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

// του appwrite για να διαχειριστούμε το bucket
const storage = new Storage(client);

// Κατεβάζει ένα excel από το Appwrite και το επιστρέφει ως Buffer.
export const downloadExcelFromAppwrite = async (
  fileId: string
): Promise<Buffer> => {
  const arrayBuffer = await storage.getFileDownload({
    bucketId: process.env.APPWRITE_BUCKET_ID!,
    fileId,
  });

  return Buffer.from(arrayBuffer);
};
