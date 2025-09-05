  import { Account, Client, Storage  } from "appwrite"; //  Import Client from "appwrite"

  const client = new Client(); // Create a new Client instance
  client
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

  export const account = new Account(client); // Export an Account instance initialized with the client

  // added later when adding appwrite media bucket
  export const storage = new Storage(client);