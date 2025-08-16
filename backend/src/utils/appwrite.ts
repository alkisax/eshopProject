import { Client, Account } from 'appwrite';

if (!process.env.APPWRITE_PROJECT_ID) {
  throw new Error('APPWRITE_PROJECT_ID secret is not defined in environment variables');
}
if (!process.env.APPWRITE_ENDPOINT) {
  throw new Error('APPWRITE_ENDPOINT is not defined in environment variables');
}

export const client = new Client()
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setEndpoint(process.env.APPWRITE_ENDPOINT);

export const account = new Account(client);
