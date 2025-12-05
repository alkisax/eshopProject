// backend/src/excel/utils/uploadImageBufferToAppwrite.ts
// 3d. util που παίρνει ένα Buffer εικόνας + filename
// το ανεβάζει στο Appwrite bucket και επιστρέφει το public URL της εικόνας

import { Client, Storage } from 'node-appwrite';
// '@ts-ignore' επειδή το Appwrite SDK εκθέτει το InputFile από το path 'node-appwrite/file' μόνο στο runtime, αλλά δεν παρέχει αντίστοιχα TypeScript type declarations για αυτό το path. Οι πραγματικές δηλώσεις τύπων βρίσκονται εσωτερικά στο dist/ και δεν είναι διαθέσιμες ως έγκυρο import. Έτσι το import λειτουργεί κανονικά σε Node.js, αλλά το TypeScript δεν μπορεί να κάνει resolve το module και βγάζει σφάλμα. Είναι περιορισμός/ασυμβατότητα του Appwrite SDK και όχι λάθος του κώδικα, οπότε παρακάμπτουμε το TS error με ts-ignore.
// @ts-ignore
import { InputFile } from 'node-appwrite/file';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Init client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

export const uploadImageBufferToAppwrite = async (
  buffer: Buffer,
  originalFilename: string
): Promise<string> => {
  const bucketId = process.env.APPWRITE_BUCKET_ID!;
  const projectId = process.env.APPWRITE_PROJECT_ID!;
  const endpoint = process.env.APPWRITE_ENDPOINT!;

  // Η path.basename() παίρνει ένα path (π.χ. "folder/subfolder/image1.jpeg")και επιστρέφει μόνο το όνομα του αρχείου, δηλαδή: "image1.jpeg"
  const safeFilename = path.basename(originalFilename);

  const fileId = uuidv4().replace(/-/g, '');

  // 1️⃣ Wrap buffer into InputFile (standard for Appwrite SDK)
  // Το Appwrite ΔΕΝ δέχεται σκέτο Buffer. Το InputFile φτιάχνει ένα "Appwrite-compatible" αρχείο. Στην πραγματικότητα δημιουργεί ένα object σαν: { type: 'buffer', fileName: 'keri1.jpg', size: 12345, buffer: <Buffer ...> }
  const inputFile = InputFile.fromBuffer(buffer, safeFilename);

  // 2️⃣ Upload in new v19 object-style format
  const createdFile = await storage.createFile({
    bucketId,
    fileId,
    file: inputFile,
  });

  // 3️⃣ κατασκευάζω το url χρησιμοποιόντας το env και το id του αρχείου
  const publicUrl = `${endpoint}/storage/buckets/${bucketId}/files/${createdFile.$id}/view?project=${projectId}`;

  return publicUrl;
};
