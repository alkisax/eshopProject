export interface ParticipantType {
  _id?: string;
  name?: string;
  surname?: string;
  email: string;
  transactions?: string[]; // array of Transaction IDs
  createdAt?: Date;
  updatedAt?: Date;
}