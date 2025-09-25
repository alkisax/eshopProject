// src/hooks/useAppwriteUploader.ts
import { useEffect, useState, useCallback } from "react";
import { Client, Storage, Account, ID, Query, type Models } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT!)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const storage = new Storage(client);

/*
Create a dedicated Appwrite “upload user”
In your Appwrite console → Auth → Users → Add a new user, e.g.
Email: upload@eshop.local
Password: xxxx.
Give this user bucket permissions (create/delete in Storage settings).
*/

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID!;
const UPLOAD_USER = import.meta.env.VITE_UPLOAD_USER!;
const UPLOAD_PASS = import.meta.env.VITE_UPLOAD_PASS!;

export function useAppwriteUploader() {
  const [ready, setReady] = useState(false);

  // auto-login with the dedicated upload user
  useEffect(() => {
    const ensureSession = async () => {
      try {
        const me = await account.get(); // check if already logged in
        console.log("Upload user already logged in:", me.email);
        setReady(true);
      } catch {
        try {
          // εδώ η δημιουργεία του session
          console.log("Logging in upload user...");
          await account.createEmailPasswordSession(UPLOAD_USER, UPLOAD_PASS);
          const me = await account.get();
          console.log("Upload user session created:", me.email);
          setReady(true);
        } catch (err) {
          console.error("Failed to login upload user:", err);
          setReady(false);
        }
      }
    };
    ensureSession();
  }, []);

  // ολα ειναι τα αντίστοιχα axios.get/post/delete κλπ αλλα για appwrite
  const uploadFile = useCallback(async (file: File) => {
    if (!ready) throw new Error("Uploader not ready");
    const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return res; // returns file metadata
  }, [ready]);

  // listFiles with pagination
  const listFiles = useCallback(
    async (page: number, limit = 10): Promise<{ files: Models.File[]; total: number }> => {
      if (!ready) throw new Error("Uploader not ready");

      // skip items from previous pages
      const offset = (page - 1) * limit;
      // queries: limit + offset + sort
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt")
      ];

      const res = await storage.listFiles(BUCKET_ID, queries);

      return {
        files: res.files,   // current page files
        total: res.total,   // total count in bucket
      };
    },
    [ready]
  );

  const deleteFile = useCallback(async (fileId: string) => {
    if (!ready) throw new Error("Uploader not ready");
    await storage.deleteFile(BUCKET_ID, fileId);
  }, [ready]);

  const getFileUrl = useCallback((fileId: string) => {
    return storage.getFileView(BUCKET_ID, fileId);
  }, []);

  return { ready, uploadFile, listFiles, deleteFile, getFileUrl };
}
